const Settings = require('../models/Settings');
const { AppError } = require('../middleware/errorHandler');

class SettingsService {
  /**
   * Ensure the 'general' group always contains a `logoUrl` key.
   * Called lazily so the field shows up in the admin UI.
   */
  async _ensureGeneralDefaults(result) {
    const defaults = { logoUrl: '' };
    let dirty = false;
    for (const [key, defaultValue] of Object.entries(defaults)) {
      if (result[key] === undefined) {
        await Settings.findOneAndUpdate(
          { group: 'general', key },
          { value: defaultValue },
          { upsert: true, new: true }
        );
        result[key] = defaultValue;
        dirty = true;
      }
    }
    return result;
  }

  /**
   * Get all settings grouped
   */
  async getAll() {
    const settings = await Settings.find().sort({ group: 1, key: 1 });
    
    // Group by group name
    const grouped = {};
    settings.forEach(s => {
      if (!grouped[s.group]) grouped[s.group] = {};
      grouped[s.group][s.key] = s.value;
    });

    // Auto-seed general defaults
    if (!grouped.general) grouped.general = {};
    await this._ensureGeneralDefaults(grouped.general);

    return grouped;
  }

  /**
   * Get settings by group
   */
  async getByGroup(group) {
    const settings = await Settings.find({ group });
    const result = {};
    settings.forEach(s => { result[s.key] = s.value; });
    if (group === 'general') await this._ensureGeneralDefaults(result);
    return result;
  }

  /**
   * Update a setting
   */
  async update(group, key, value, userId) {
    const setting = await Settings.findOneAndUpdate(
      { group, key },
      { value, updatedBy: userId },
      { new: true, upsert: true }
    );
    return setting;
  }

  /**
   * Update multiple settings in a group
   */
  async updateGroup(group, settings, userId) {
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      const setting = await Settings.findOneAndUpdate(
        { group, key },
        { value, updatedBy: userId },
        { new: true, upsert: true }
      );
      results.push(setting);
    }
    return results;
  }

  /**
   * Get a single setting
   */
  async getOne(group, key) {
    const setting = await Settings.findOne({ group, key });
    if (!setting) throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    return setting;
  }

  /**
   * Delete a setting
   */
  async delete(group, key) {
    const setting = await Settings.findOneAndDelete({ group, key });
    if (!setting) throw new AppError('Setting not found', 404, 'SETTING_NOT_FOUND');
    return { message: 'Setting deleted successfully' };
  }
}

module.exports = new SettingsService();
