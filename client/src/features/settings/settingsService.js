// Media cihazlarını almak için yardımcı fonksiyon
const getMediaDevices = async () => {
  try {
    // Kullanıcıdan medya izinlerini iste
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    
    // Tüm cihazları listele
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    // Cihazları kategorilerine göre ayır
    const audioInput = devices.filter(device => device.kind === 'audioinput');
    const audioOutput = devices.filter(device => device.kind === 'audiooutput');
    const videoInput = devices.filter(device => device.kind === 'videoinput');
    
    return { audioInput, audioOutput, videoInput };
  } catch (error) {
    console.error('Medya cihazları alınırken hata oluştu:', error);
    throw new Error('Medya cihazları alınamadı. Lütfen kamera ve mikrofon izinlerini kontrol edin.');
  }
};

// Kullanılabilir cihazları getir
const getAvailableDevices = async () => {
  try {
    const devices = await getMediaDevices();
    return devices;
  } catch (error) {
    console.error('Kullanılabilir cihazlar alınırken hata:', error);
    throw error;
  }
};

// Ayarları güncelle (yerel depolamada)
const updateSettings = async (settingsData) => {
  try {
    // Bu fonksiyon API yerine yerel depolamayı kullanır, ancak ileride bir API istemi eklenebilir
    
    // Var olan ayarları al
    const existingSettings = JSON.parse(localStorage.getItem('settings') || '{}');
    
    // Yeni ayarlarla güncelle
    const updatedSettings = {
      ...existingSettings,
      ...settingsData,
    };
    
    // Güncellenmiş ayarları depolama
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
    
    return updatedSettings;
  } catch (error) {
    console.error('Ayarlar güncellenirken hata:', error);
    throw error;
  }
};

// Ses cihazını test et
const testAudioDevice = async (deviceId) => {
  try {
    // Test etmek için seçilen ses cihazını kullanarak bir akış oluştur
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } }
    });
    
    // Ses akışını kullanarak bir AudioContext oluştur
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContext.createMediaStreamSource(stream);
    
    // Ses seviyesini analiz etmek için bir AnalyserNode oluştur
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    
    // Test başarılı olduğundan, akışı döndür ve sonra daha sonra durdurulabilir
    return {
      stream,
      stopTest: () => {
        stream.getTracks().forEach(track => track.stop());
        audioContext.close();
      }
    };
  } catch (error) {
    console.error('Ses cihazı test edilirken hata:', error);
    throw new Error('Ses cihazı test edilemedi. Cihaz bağlı değil veya kullanımda olabilir.');
  }
};

// Karanlık/Aydınlık tema değiştirme
const toggleTheme = (theme) => {
  try {
    document.documentElement.setAttribute('data-theme', theme);
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.theme = theme;
    localStorage.setItem('settings', JSON.stringify(settings));
    return theme;
  } catch (error) {
    console.error('Tema değiştirme hatası:', error);
    throw error;
  }
};

// Dil ayarını güncelleme
const changeLanguage = (language) => {
  try {
    const settings = JSON.parse(localStorage.getItem('settings') || '{}');
    settings.language = language;
    localStorage.setItem('settings', JSON.stringify(settings));
    return language;
  } catch (error) {
    console.error('Dil değiştirme hatası:', error);
    throw error;
  }
};

// Ayarları varsayılana sıfırla
const resetToDefaults = () => {
  try {
    const defaultSettings = {
      theme: 'dark',
      audioInputDevice: null,
      audioOutputDevice: null,
      videoInputDevice: null,
      notificationSound: true,
      pushNotifications: true,
      microphoneSensitivity: 50,
      noiseSupression: true,
      echoCancellation: true,
      autoGainControl: true,
      noiseSuppression: true,
      displayQuality: 'balanced',
      language: 'tr',
      privacySettings: {
        shareOnlineStatus: true,
        allowDirectMessages: true,
        allowFriendRequests: true
      }
    };

    localStorage.setItem('settings', JSON.stringify(defaultSettings));
    document.documentElement.setAttribute('data-theme', defaultSettings.theme);
    
    return defaultSettings;
  } catch (error) {
    console.error('Varsayılan ayarlara sıfırlama hatası:', error);
    throw error;
  }
};

const settingsService = {
  getAvailableDevices,
  updateSettings,
  testAudioDevice,
  toggleTheme,
  changeLanguage,
  resetToDefaults
};

export default settingsService;