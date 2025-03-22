import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getAvailableDevices, 
  updateSettings, 
  testAudioSettings,
  setTheme,
  setLanguage,
  setAudioInputDevice,
  setAudioOutputDevice,
  setVideoInputDevice,
  setNotificationSound,
  setPushNotifications,
  setMicrophoneSensitivity,
  setNoiseSupression,
  setEchoCancellation,
  setAutoGainControl,
  setDisplayQuality,
  setPrivacySettings,
  resetSettings
} from '../../features/settings/settingsSlice';
import './SettingsPage.css';

const SettingsPage = () => {
  const dispatch = useDispatch();
  const { settings, availableDevices, isLoading } = useSelector(state => state.settings);
  const [activeTab, setActiveTab] = useState('general');
  const [testingAudio, setTestingAudio] = useState(false);
  const [audioTestStream, setAudioTestStream] = useState(null);
  
  // Sayfa yüklendiğinde kullanılabilir cihazları getir
  useEffect(() => {
    dispatch(getAvailableDevices());
  }, [dispatch]);
  
  // Ses test işlevselliği
  const handleAudioTest = async (deviceId) => {
    if (testingAudio) {
      // Eğer test zaten çalışıyorsa, durdur
      if (audioTestStream) {
        audioTestStream.stopTest();
        setAudioTestStream(null);
      }
      setTestingAudio(false);
    } else {
      try {
        setTestingAudio(true);
        // Ses cihazını test et
        const response = await dispatch(testAudioSettings(deviceId)).unwrap();
        setAudioTestStream(response);
      } catch (error) {
        console.error('Ses testi başlatılamadı:', error);
      }
    }
  };
  
  // Temayı değiştirme
  const handleThemeChange = (theme) => {
    dispatch(setTheme(theme));
    document.documentElement.setAttribute('data-theme', theme);
  };
  
  // Dili değiştirme
  const handleLanguageChange = (language) => {
    dispatch(setLanguage(language));
  };
  
  // Ses giriş cihazını değiştirme
  const handleAudioInputChange = (deviceId) => {
    dispatch(setAudioInputDevice(deviceId));
  };
  
  // Ses çıkış cihazını değiştirme
  const handleAudioOutputChange = (deviceId) => {
    dispatch(setAudioOutputDevice(deviceId));
  };
  
  // Video giriş cihazını değiştirme
  const handleVideoInputChange = (deviceId) => {
    dispatch(setVideoInputDevice(deviceId));
  };
  
  // Bildirim sesini değiştirme
  const handleNotificationSoundChange = (value) => {
    dispatch(setNotificationSound(value));
  };
  
  // Push bildirimleri değiştirme
  const handlePushNotificationsChange = (value) => {
    dispatch(setPushNotifications(value));
  };
  
  // Mikrofon hassasiyetini değiştirme
  const handleMicSensitivityChange = (value) => {
    dispatch(setMicrophoneSensitivity(parseInt(value)));
  };
  
  // Gürültü bastırmayı değiştirme
  const handleNoiseSuppressionChange = (value) => {
    dispatch(setNoiseSupression(value));
  };
  
  // Eko iptali değiştirme
  const handleEchoCancellationChange = (value) => {
    dispatch(setEchoCancellation(value));
  };
  
  // Otomatik kazanç kontrolünü değiştirme
  const handleAutoGainControlChange = (value) => {
    dispatch(setAutoGainControl(value));
  };
  
  // Ekran kalitesini değiştirme
  const handleDisplayQualityChange = (value) => {
    dispatch(setDisplayQuality(value));
  };
  
  // Gizlilik ayarlarını değiştirme
  const handlePrivacySettingChange = (setting, value) => {
    dispatch(setPrivacySettings({
      [setting]: value
    }));
  };
  
  // Ayarları sıfırlama
  const handleResetSettings = () => {
    if (window.confirm('Tüm ayarları varsayılana sıfırlamak istediğinizden emin misiniz?')) {
      dispatch(resetSettings());
    }
  };
  
  // Sayfa kapatılmadan önce test akışını temizle
  useEffect(() => {
    return () => {
      if (audioTestStream) {
        audioTestStream.stopTest();
      }
    };
  }, [audioTestStream]);
  
  return (
    <div className="settings-container">
      <div className="settings-sidebar">
        <h1>Ayarlar</h1>
        <ul>
          <li 
            className={activeTab === 'general' ? 'active' : ''} 
            onClick={() => setActiveTab('general')}
          >
            Genel
          </li>
          <li 
            className={activeTab === 'audio' ? 'active' : ''} 
            onClick={() => setActiveTab('audio')}
          >
            Ses
          </li>
          <li 
            className={activeTab === 'video' ? 'active' : ''} 
            onClick={() => setActiveTab('video')}
          >
            Video
          </li>
          <li 
            className={activeTab === 'notifications' ? 'active' : ''} 
            onClick={() => setActiveTab('notifications')}
          >
            Bildirimler
          </li>
          <li 
            className={activeTab === 'privacy' ? 'active' : ''} 
            onClick={() => setActiveTab('privacy')}
          >
            Gizlilik
          </li>
        </ul>
        <button 
          className="reset-button"
          onClick={handleResetSettings}
        >
          Varsayılana Sıfırla
        </button>
      </div>
      
      <div className="settings-content">
        {isLoading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <>
            {activeTab === 'general' && (
              <div className="settings-panel">
                <h2>Genel Ayarlar</h2>
                
                <div className="settings-group">
                  <h3>Arayüz</h3>
                  
                  <div className="settings-field">
                    <label>Tema</label>
                    <div className="theme-selector">
                      <div 
                        className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('dark')}
                      >
                        <div className="theme-preview dark"></div>
                        <span>Karanlık</span>
                      </div>
                      <div 
                        className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                        onClick={() => handleThemeChange('light')}
                      >
                        <div className="theme-preview light"></div>
                        <span>Aydınlık</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="settings-field">
                    <label>Dil</label>
                    <select 
                      value={settings.language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">İngilizce</option>
                      <option value="de">Almanca</option>
                      <option value="fr">Fransızca</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'audio' && (
              <div className="settings-panel">
                <h2>Ses Ayarları</h2>
                
                <div className="settings-group">
                  <h3>Ses Cihazları</h3>
                  
                  <div className="settings-field">
                    <label>Mikrofon</label>
                    <div className="device-selector">
                      <select 
                        value={settings.audioInputDevice || ''}
                        onChange={(e) => handleAudioInputChange(e.target.value)}
                      >
                        <option value="">Varsayılan Mikrofon</option>
                        {availableDevices.audioInput && availableDevices.audioInput.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Mikrofon ${device.deviceId.slice(0, 5)}`}
                          </option>
                        ))}
                      </select>
                      
                      <button 
                        className={`test-button ${testingAudio ? 'testing' : ''}`}
                        onClick={() => handleAudioTest(settings.audioInputDevice)}
                      >
                        {testingAudio ? 'Durdur' : 'Test Et'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="settings-field">
                    <label>Hoparlör</label>
                    <select 
                      value={settings.audioOutputDevice || ''}
                      onChange={(e) => handleAudioOutputChange(e.target.value)}
                    >
                      <option value="">Varsayılan Hoparlör</option>
                      {availableDevices.audioOutput && availableDevices.audioOutput.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Hoparlör ${device.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Mikrofon Ayarları</h3>
                  
                  <div className="settings-field">
                    <label>Mikrofon Hassasiyeti: {settings.microphoneSensitivity}%</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.microphoneSensitivity}
                      onChange={(e) => handleMicSensitivityChange(e.target.value)}
                    />
                  </div>
                  
                  <div className="settings-field checkbox-field">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.noiseSupression}
                        onChange={(e) => handleNoiseSuppressionChange(e.target.checked)}
                      />
                      Gürültü Bastırma
                    </label>
                  </div>
                  
                  <div className="settings-field checkbox-field">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.echoCancellation}
                        onChange={(e) => handleEchoCancellationChange(e.target.checked)}
                      />
                      Eko İptali
                    </label>
                  </div>
                  
                  <div className="settings-field checkbox-field">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.autoGainControl}
                        onChange={(e) => handleAutoGainControlChange(e.target.checked)}
                      />
                      Otomatik Kazanç Kontrolü
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'video' && (
              <div className="settings-panel">
                <h2>Video Ayarları</h2>
                
                <div className="settings-group">
                  <h3>Kamera</h3>
                  
                  <div className="settings-field">
                    <label>Kamera Seçimi</label>
                    <select 
                      value={settings.videoInputDevice || ''}
                      onChange={(e) => handleVideoInputChange(e.target.value)}
                    >
                      <option value="">Varsayılan Kamera</option>
                      {availableDevices.videoInput && availableDevices.videoInput.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                          {device.label || `Kamera ${device.deviceId.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="settings-group">
                  <h3>Görüntü Kalitesi</h3>
                  
                  <div className="settings-field">
                    <label>Ekran Paylaşımı/Görüntü Kalitesi</label>
                    <select 
                      value={settings.displayQuality}
                      onChange={(e) => handleDisplayQualityChange(e.target.value)}
                    >
                      <option value="low">Düşük (Daha Az Bant Genişliği)</option>
                      <option value="balanced">Dengeli</option>
                      <option value="high">Yüksek (Daha Çok Bant Genişliği)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'notifications' && (
              <div className="settings-panel">
                <h2>Bildirim Ayarları</h2>
                
                <div className="settings-group">
                  <div className="settings-field checkbox-field">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.notificationSound}
                        onChange={(e) => handleNotificationSoundChange(e.target.checked)}
                      />
                      Bildirim Sesleri
                    </label>
                  </div>
                  
                  <div className="settings-field checkbox-field">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.pushNotifications}
                        onChange={(e) => handlePushNotificationsChange(e.target.checked)}
                      />
                      Push Bildirimleri
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'privacy' && (
              <div className="settings-panel">
                <h2>Gizlilik Ayarları</h2>
                
                <div className="settings-group">
                  <div className="settings-field checkbox-field">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.privacySettings.shareOnlineStatus}
                        onChange={(e) => handlePrivacySettingChange('shareOnlineStatus', e.target.checked)}
                      />
                      Çevrimiçi Durumumu Paylaş
                    </label>
                  </div>
                  
                  <div className="settings-field checkbox-field">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.privacySettings.allowDirectMessages}
                        onChange={(e) => handlePrivacySettingChange('allowDirectMessages', e.target.checked)}
                      />
                      Doğrudan Mesajlara İzin Ver
                    </label>
                  </div>
                  
                  <div className="settings-field checkbox-field">
                    <label>
                      <input 
                        type="checkbox" 
                        checked={settings.privacySettings.allowFriendRequests}
                        onChange={(e) => handlePrivacySettingChange('allowFriendRequests', e.target.checked)}
                      />
                      Arkadaşlık İsteklerine İzin Ver
                    </label>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;