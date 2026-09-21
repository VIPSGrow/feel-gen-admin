interface Setting {
    id: number;
    setting_key: string;
    setting_value: SettingValue;
    category: string;
    updated_at: string;
}
interface SettingValue {
    [key: string]: string | number | boolean | null;
}
