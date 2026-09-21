"use client";
import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Switch from '@/components/form/switch/Switch';
import serverCallFuction from '@/lib/constantFunction';
import { Settings, ChevronLeft, Save, LocationEdit } from 'lucide-react';



const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    communication: 'info',
    design: 'primary',
    finance: 'success',
    security: 'warning'
  };
  return colors[category] || 'primary';
};



const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [settingsData, setSettingsData] = useState<Setting[]>([]);
  const [settingsValues, setSettingsValues] = useState<Record<number, SettingValue>>(() => {
    const initial: Record<number, SettingValue> = {};
    settingsData.forEach((setting) => {
      initial[setting.id] = { ...setting.setting_value };
    });
    return initial;
  });
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);

  const currentSetting = settingsData[activeTab];
  // const [currentValue, setcurrentValue] = useState(settingsValues[currentSetting?.id || 0]);
  const currentValue = settingsValues[currentSetting?.id || 0];

  const handleInputChange = useCallback((field: string, value: string | number | boolean | null) => {
    if (currentSetting) {
      const data = {
        ...settingsValues,
        [currentSetting.id]: {
          ...settingsValues[currentSetting.id],
          [field]: value
        }
      }
      setSettingsValues(prev => data);

      // console.log("data - ",data);

      // setcurrentValue(data[currentSetting?.id || 0])
    }
  }, [currentSetting]);

  useEffect(() => {
    fetchSettings()
  }, [])




  useEffect(() => {
    const initialValues: Record<number, SettingValue> = {};
    settingsData.forEach((setting) => {
      initialValues[setting.id] = { ...setting.setting_value };
    });
    setSettingsValues(initialValues);
  }, [settingsData])



  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await serverCallFuction('GET', 'api/settings');
      setSettingsData(data.data || []);
    } catch (error) {
      console.error('Error fetching settings', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabSave = async () => {
    if (!currentSetting) return;
    setLoading(true);
    try {
      const response = await serverCallFuction('PUT', `api/settings/${currentSetting.setting_key}`, {
        setting_value: settingsValues[currentSetting.id]
      });
      if (response.success) {
        alert(`${currentSetting.setting_key} saved successfully!`);
        // Refresh data
        await fetchSettings();
      }
    } catch (error) {
      console.error('Error saving setting', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeoLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Position obtained:', position.coords.latitude, position.coords.longitude);
        handleInputChange('lat', position.coords.latitude);
        handleInputChange('lng', position.coords.longitude);
        setGeoLoading(false);
      },
      (error) => {
        alert('Error getting location: ' + error.message);
        setGeoLoading(false);
      }
    );
  };

  const handleFileChange = async (key: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // यहाँ आपका अपना अपलोड API आएगा
    const response = await serverCallFuction('POST', 'api/upload', formData);
    if (response.success) {
      handleInputChange(key, response.url); // DB में URL स्टोर करने के लिए
    }
  };
  const renderFormField = (key: string, value: string | number | boolean | null) => {

    if (key.includes('bg') || key.includes('id_') || key.includes('url')) {
      return (
        <div className="space-y-2">
          <Label>{key.replace(/[_]/g, ' ').toUpperCase()}</Label>
          <div className="flex items-center gap-4">
            {value && (
              <img
                src={value}
                alt="Preview"
                className="w-16 h-10 object-cover rounded border"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(key, file);
              }}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <Switch
          label={key.replace(/[_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          defaultChecked={value}
          onChange={(checked) => handleInputChange(key, checked)}
        />
      );
    }
    if (value != null && typeof value === 'number') {
      return (
        <div>
          <Label>{key.replace(/[_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          <Input
            type="number"
            placeholder={`Enter ${key}`}
            defaultValue={value}
            onChange={(e) => handleInputChange(key, isNaN(parseFloat(e.target.value)) ? null : parseFloat(e.target.value))}
          />
        </div>
      );
    }
    if (typeof value === 'string' && (value.includes('{') || value.length > 50)) {
      return (
        <div>
          <Label>{key.replace(/[_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          <TextArea
            value={String(value ?? '')}
            onChange={(val) => handleInputChange(key, val)}
            rows={3}
            placeholder={`Enter ${key}`}
          />
        </div>
      );
    }
    return (
      <div>
        <Label>{key.replace(/[_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
        <Input
          type="text"
          placeholder={`Enter ${key}`}
          defaultValue={String(value ?? '')}
          onChange={(e) => handleInputChange(key, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800">
            <ChevronLeft className="w-5 h-5" />
          </Link> */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your application settings</p>
          </div>
        </div>
        <Button onClick={handleTabSave} disabled={loading} className="gap-2">
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2 bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Configuration</h3>
          {settingsData.map((setting, index) => (
            <Button
              key={setting.id}
              variant={activeTab === index ? 'primary' : 'ghost'}
              size="md"
              // className="w-full justify-start h-14 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              className='w-full justify-start'
              onClick={() => setActiveTab(index)}
            >
              <Settings className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>{setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {currentSetting && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
              <div className="flex items-center mb-8 gap-3">
                <Badge
                  color={getCategoryColor(currentSetting.category) as any}
                  variant="solid"
                  size="sm"
                >
                  {currentSetting.category.toUpperCase()}
                </Badge>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last updated: {new Date(currentSetting.updated_at).toLocaleString()}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 capitalize">
                {currentSetting.setting_key.replace(/_/g, ' ')}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(currentValue || {}).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    {renderFormField(key, value)}
                  </div>
                ))}
                {currentSetting.setting_key === "geo_lock_config" && (<>
                  <Button startIcon={<LocationEdit />} variant='primary' onClick={handleGeoLocation} >Use my Current Location</Button>
                </>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

