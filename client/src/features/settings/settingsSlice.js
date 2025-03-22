import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import settingsService from './settingsService';

// Yerel depolamadan ayarları al
const storedSettings = JSON.parse(localStorage.getItem('settings'));

const initialState = {
  settings: storedSettings || {
    theme: 'dark', // dark veya light
    audioInputDevice: null,
    audioOutputDevice: null,
    videoInputDevice: null,
    notificationSound: true,
    pushNotifications: true,
    microphoneSensitivity: 50, // 0-100 arası değer
    noiseSupression: true,
    echoCancellation: true,
    autoGainControl: true,
    noiseSuppression: true,
    displayQuality: 'balanced', // low, balanced, high
    language: 'tr', // tr, en, vb.
    privacySettings: {
      shareOnlineStatus: true,
      allowDirectMessages: true,
      allowFriendRequests: true
    }
  },
  availableDevices: {
    audioInput: [],
    audioOutput: [],
    videoInput: []
  },
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Mevcut cihazları getir
export const getAvailableDevices = createAsyncThunk(
  'settings/getAvailableDevices',
  async (_, thunkAPI) => {
    try {
      return await settingsService.getAvailableDevices();
    } catch (error) {
      const message = error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Ayarları güncelle
export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (settingsData, thunkAPI) => {
    try {
      return await settingsService.updateSettings(settingsData);
    } catch (error) {
      const message = error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Test ses ayarları
export const testAudioSettings = createAsyncThunk(
  'settings/testAudioSettings',
  async (deviceId, thunkAPI) => {
    try {
      return await settingsService.testAudioDevice(deviceId);
    } catch (error) {
      const message = error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    resetSettingsState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setTheme: (state, action) => {
      state.settings.theme = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setLanguage: (state, action) => {
      state.settings.language = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setAudioInputDevice: (state, action) => {
      state.settings.audioInputDevice = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setAudioOutputDevice: (state, action) => {
      state.settings.audioOutputDevice = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setVideoInputDevice: (state, action) => {
      state.settings.videoInputDevice = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setNotificationSound: (state, action) => {
      state.settings.notificationSound = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setPushNotifications: (state, action) => {
      state.settings.pushNotifications = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setMicrophoneSensitivity: (state, action) => {
      state.settings.microphoneSensitivity = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setNoiseSupression: (state, action) => {
      state.settings.noiseSupression = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setEchoCancellation: (state, action) => {
      state.settings.echoCancellation = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setAutoGainControl: (state, action) => {
      state.settings.autoGainControl = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setNoiseSuppression: (state, action) => {
      state.settings.noiseSuppression = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setDisplayQuality: (state, action) => {
      state.settings.displayQuality = action.payload;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    setPrivacySettings: (state, action) => {
      state.settings.privacySettings = {
        ...state.settings.privacySettings,
        ...action.payload
      };
      localStorage.setItem('settings', JSON.stringify(state.settings));
    },
    resetSettings: (state) => {
      state.settings = initialState.settings;
      localStorage.setItem('settings', JSON.stringify(state.settings));
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAvailableDevices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAvailableDevices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.availableDevices = action.payload;
      })
      .addCase(getAvailableDevices.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.settings = { ...state.settings, ...action.payload };
        localStorage.setItem('settings', JSON.stringify(state.settings));
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(testAudioSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(testAudioSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(testAudioSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const {
  resetSettingsState,
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
  setNoiseSuppression,
  setDisplayQuality,
  setPrivacySettings,
  resetSettings
} = settingsSlice.actions;
export default settingsSlice.reducer;