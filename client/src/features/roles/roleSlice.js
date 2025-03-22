import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import roleService from './roleService';

const initialState = {
  roles: [],
  serverRoles: {}, // sunucu ID'ye göre roller: { serverId: [roles] }
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Sunucu rollerini getir
export const getServerRoles = createAsyncThunk(
  'roles/getServerRoles',
  async (serverId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roleService.getServerRoles(serverId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Rol oluştur
export const createRole = createAsyncThunk(
  'roles/create',
  async (roleData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roleService.createRole(roleData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Rol güncelle
export const updateRole = createAsyncThunk(
  'roles/update',
  async ({ roleId, roleData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roleService.updateRole(roleId, roleData, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Rol sil
export const deleteRole = createAsyncThunk(
  'roles/delete',
  async (roleId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roleService.deleteRole(roleId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Kullanıcıya rol ata
export const assignRoleToUser = createAsyncThunk(
  'roles/assignToUser',
  async ({ roleId, userId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roleService.assignRoleToUser(roleId, userId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Kullanıcıdan rol kaldır
export const removeRoleFromUser = createAsyncThunk(
  'roles/removeFromUser',
  async ({ roleId, userId }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roleService.removeRoleFromUser(roleId, userId, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Rol izinlerini güncelle
export const updateRolePermissions = createAsyncThunk(
  'roles/updatePermissions',
  async ({ roleId, permissions }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roleService.updateRolePermissions(roleId, permissions, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Rol sırasını güncelle
export const updateRoleOrder = createAsyncThunk(
  'roles/updateOrder',
  async ({ serverId, roleOrder }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.user.token;
      return await roleService.updateRoleOrder(serverId, roleOrder, token);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    resetRoles: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearRoles: (state) => {
      state.roles = [];
      state.serverRoles = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getServerRoles.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getServerRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Sunucu ID'sine göre rolleri sakla
        state.serverRoles[action.meta.arg] = action.payload;
      })
      .addCase(getServerRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Rolü hem genel rol listesine hem de ilgili sunucu rollerine ekle
        state.roles.push(action.payload);
        
        const serverId = action.payload.serverId;
        if (!state.serverRoles[serverId]) {
          state.serverRoles[serverId] = [];
        }
        state.serverRoles[serverId].push(action.payload);
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        // Genel rol listesini güncelle
        const roleIndex = state.roles.findIndex(role => role.id === action.payload.id);
        if (roleIndex !== -1) {
          state.roles[roleIndex] = action.payload;
        }
        
        // Sunucu rollerini güncelle
        const serverId = action.payload.serverId;
        if (state.serverRoles[serverId]) {
          const serverRoleIndex = state.serverRoles[serverId].findIndex(
            role => role.id === action.payload.id
          );
          if (serverRoleIndex !== -1) {
            state.serverRoles[serverId][serverRoleIndex] = action.payload;
          }
        }
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteRole.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        
        const { id, serverId } = action.payload;
        
        // Genel rol listesinden kaldır
        state.roles = state.roles.filter(role => role.id !== id);
        
        // Sunucu rollerinden kaldır
        if (state.serverRoles[serverId]) {
          state.serverRoles[serverId] = state.serverRoles[serverId].filter(
            role => role.id !== id
          );
        }
      })
      .addCase(deleteRole.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(assignRoleToUser.fulfilled, (state, action) => {
        state.isSuccess = true;
        
        // Rolün üye listesini güncelle
        const { roleId, userId, serverId } = action.payload;
        
        // Genel rol listesinde güncelle
        const roleIndex = state.roles.findIndex(role => role.id === roleId);
        if (roleIndex !== -1 && state.roles[roleIndex].members) {
          if (!state.roles[roleIndex].members.includes(userId)) {
            state.roles[roleIndex].members.push(userId);
          }
        }
        
        // Sunucu rollerinde güncelle
        if (state.serverRoles[serverId]) {
          const serverRoleIndex = state.serverRoles[serverId].findIndex(
            role => role.id === roleId
          );
          if (serverRoleIndex !== -1 && state.serverRoles[serverId][serverRoleIndex].members) {
            if (!state.serverRoles[serverId][serverRoleIndex].members.includes(userId)) {
              state.serverRoles[serverId][serverRoleIndex].members.push(userId);
            }
          }
        }
      })
      .addCase(removeRoleFromUser.fulfilled, (state, action) => {
        state.isSuccess = true;
        
        // Rolün üye listesini güncelle
        const { roleId, userId, serverId } = action.payload;
        
        // Genel rol listesinde güncelle
        const roleIndex = state.roles.findIndex(role => role.id === roleId);
        if (roleIndex !== -1 && state.roles[roleIndex].members) {
          state.roles[roleIndex].members = state.roles[roleIndex].members.filter(
            id => id !== userId
          );
        }
        
        // Sunucu rollerinde güncelle
        if (state.serverRoles[serverId]) {
          const serverRoleIndex = state.serverRoles[serverId].findIndex(
            role => role.id === roleId
          );
          if (serverRoleIndex !== -1 && state.serverRoles[serverId][serverRoleIndex].members) {
            state.serverRoles[serverId][serverRoleIndex].members = state.serverRoles[serverId][serverRoleIndex].members.filter(
              id => id !== userId
            );
          }
        }
      })
      .addCase(updateRolePermissions.fulfilled, (state, action) => {
        state.isSuccess = true;
        
        const { id, permissions, serverId } = action.payload;
        
        // Genel rol listesini güncelle
        const roleIndex = state.roles.findIndex(role => role.id === id);
        if (roleIndex !== -1) {
          state.roles[roleIndex].permissions = permissions;
        }
        
        // Sunucu rollerini güncelle
        if (state.serverRoles[serverId]) {
          const serverRoleIndex = state.serverRoles[serverId].findIndex(
            role => role.id === id
          );
          if (serverRoleIndex !== -1) {
            state.serverRoles[serverId][serverRoleIndex].permissions = permissions;
          }
        }
      })
      .addCase(updateRoleOrder.fulfilled, (state, action) => {
        state.isSuccess = true;
        
        const { serverId, roles } = action.payload;
        
        // Sunucu rollerini güncelle
        state.serverRoles[serverId] = roles;
        
        // Genel rol listesini de güncelle
        roles.forEach(updatedRole => {
          const roleIndex = state.roles.findIndex(role => role.id === updatedRole.id);
          if (roleIndex !== -1) {
            state.roles[roleIndex] = {
              ...state.roles[roleIndex],
              position: updatedRole.position,
            };
          }
        });
      });
  },
});

export const { resetRoles, clearRoles } = roleSlice.actions;
export default roleSlice.reducer;