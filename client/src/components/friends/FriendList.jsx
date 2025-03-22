import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  getFriends, 
  getPendingRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  searchUsers,
  sendFriendRequest
} from '../../features/friends/friendSlice';
import { FaUserPlus, FaUserMinus, FaCheck, FaTimes, FaSearch, FaCircle } from 'react-icons/fa';
import './FriendList.css';

const FriendList = () => {
  const dispatch = useDispatch();
  const { 
    friends, 
    pendingRequests, 
    sentRequests, 
    onlineFriends,
    isLoading 
  } = useSelector(state => state.friends);
  const [activeTab, setActiveTab] = useState('online');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Arkadaş listelerini yükle
  useEffect(() => {
    dispatch(getFriends());
    dispatch(getPendingRequests());
    dispatch(getSentRequests());
  }, [dispatch]);

  // Arama işlevi
  const handleSearch = async () => {
    if (searchTerm.trim() !== '') {
      setIsSearching(true);
      try {
        const resultAction = await dispatch(searchUsers(searchTerm));
        if (searchUsers.fulfilled.match(resultAction)) {
          setSearchResults(resultAction.payload);
        }
      } catch (error) {
        console.error('Kullanıcı araması başarısız oldu:', error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  // Enter tuşuna basıldığında arama yap
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Arkadaşlık isteği gönder
  const handleSendRequest = (userId) => {
    dispatch(sendFriendRequest(userId));
  };

  // Arkadaşlık isteğini kabul et
  const handleAcceptRequest = (requestId) => {
    dispatch(acceptFriendRequest(requestId));
  };

  // Arkadaşlık isteğini reddet
  const handleRejectRequest = (requestId) => {
    dispatch(rejectFriendRequest(requestId));
  };

  // Arkadaşlık isteğini iptal et
  const handleCancelRequest = (requestId) => {
    dispatch(cancelFriendRequest(requestId));
  };

  // Arkadaşı kaldır
  const handleRemoveFriend = (friendId) => {
    if (window.confirm('Bu arkadaşı listenizden kaldırmak istediğinizden emin misiniz?')) {
      dispatch(removeFriend(friendId));
    }
  };

  // Aktif sekmeye göre içeriği render et
  const renderContent = () => {
    switch (activeTab) {
      case 'online':
        return (
          <div className="friend-list">
            <h3>Çevrimiçi - {friends.filter(friend => onlineFriends.includes(friend.id)).length}</h3>
            {friends.filter(friend => onlineFriends.includes(friend.id)).length === 0 ? (
              <p className="no-friends">Çevrimiçi arkadaşınız bulunmuyor.</p>
            ) : (
              friends
                .filter(friend => onlineFriends.includes(friend.id))
                .map(friend => (
                  <div key={friend.id} className="friend-item">
                    <div className="friend-info">
                      <div className="friend-avatar">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.username} />
                        ) : (
                          <div className="default-avatar">{friend.username.charAt(0).toUpperCase()}</div>
                        )}
                        <span className="status-indicator online">
                          <FaCircle />
                        </span>
                      </div>
                      <div className="friend-details">
                        <h4>{friend.username}</h4>
                        <p>Çevrimiçi</p>
                      </div>
                    </div>
                    <div className="friend-actions">
                      <button 
                        className="action-button remove" 
                        onClick={() => handleRemoveFriend(friend.id)}
                        title="Arkadaşı Kaldır"
                      >
                        <FaUserMinus />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        );
      case 'all':
        return (
          <div className="friend-list">
            <h3>Tüm Arkadaşlar - {friends.length}</h3>
            {friends.length === 0 ? (
              <p className="no-friends">Henüz hiç arkadaşınız yok. Yeni arkadaşlar ekleyebilirsiniz!</p>
            ) : (
              friends.map(friend => (
                <div key={friend.id} className="friend-item">
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.username} />
                      ) : (
                        <div className="default-avatar">{friend.username.charAt(0).toUpperCase()}</div>
                      )}
                      <span className={`status-indicator ${onlineFriends.includes(friend.id) ? 'online' : 'offline'}`}>
                        <FaCircle />
                      </span>
                    </div>
                    <div className="friend-details">
                      <h4>{friend.username}</h4>
                      <p>{onlineFriends.includes(friend.id) ? 'Çevrimiçi' : 'Çevrimdışı'}</p>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <button 
                      className="action-button remove" 
                      onClick={() => handleRemoveFriend(friend.id)}
                      title="Arkadaşı Kaldır"
                    >
                      <FaUserMinus />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'pending':
        return (
          <div className="friend-list">
            <h3>Bekleyen İstekler - {pendingRequests.length}</h3>
            {pendingRequests.length === 0 ? (
              <p className="no-friends">Bekleyen arkadaşlık isteği bulunmuyor.</p>
            ) : (
              pendingRequests.map(request => (
                <div key={request.id} className="friend-item">
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {request.sender.avatar ? (
                        <img src={request.sender.avatar} alt={request.sender.username} />
                      ) : (
                        <div className="default-avatar">{request.sender.username.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <div className="friend-details">
                      <h4>{request.sender.username}</h4>
                      <p>İstek gönderdi</p>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <button 
                      className="action-button accept" 
                      onClick={() => handleAcceptRequest(request.id)}
                      title="Kabul Et"
                    >
                      <FaCheck />
                    </button>
                    <button 
                      className="action-button reject" 
                      onClick={() => handleRejectRequest(request.id)}
                      title="Reddet"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'sent':
        return (
          <div className="friend-list">
            <h3>Gönderilen İstekler - {sentRequests.length}</h3>
            {sentRequests.length === 0 ? (
              <p className="no-friends">Gönderilen arkadaşlık isteği bulunmuyor.</p>
            ) : (
              sentRequests.map(request => (
                <div key={request.id} className="friend-item">
                  <div className="friend-info">
                    <div className="friend-avatar">
                      {request.recipient.avatar ? (
                        <img src={request.recipient.avatar} alt={request.recipient.username} />
                      ) : (
                        <div className="default-avatar">{request.recipient.username.charAt(0).toUpperCase()}</div>
                      )}
                    </div>
                    <div className="friend-details">
                      <h4>{request.recipient.username}</h4>
                      <p>İstek gönderildi</p>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <button 
                      className="action-button cancel" 
                      onClick={() => handleCancelRequest(request.id)}
                      title="İsteği İptal Et"
                    >
                      <FaTimes />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'add':
        return (
          <div className="friend-list">
            <h3>Arkadaş Ekle</h3>
            <div className="search-bar">
              <input
                type="text"
                placeholder="Kullanıcı adı veya e-posta ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button 
                className="search-button"
                onClick={handleSearch}
                disabled={isSearching}
              >
                <FaSearch />
              </button>
            </div>

            {isSearching ? (
              <p className="searching">Aranıyor...</p>
            ) : searchResults.length > 0 ? (
              <div className="search-results">
                {searchResults.map(user => {
                  // Kullanıcının durumunu kontrol et (arkadaş, bekleyen istek, vb.)
                  const isFriend = friends.some(friend => friend.id === user.id);
                  const hasPendingRequest = pendingRequests.some(req => req.sender.id === user.id);
                  const hasSentRequest = sentRequests.some(req => req.recipient.id === user.id);

                  return (
                    <div key={user.id} className="friend-item">
                      <div className="friend-info">
                        <div className="friend-avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.username} />
                          ) : (
                            <div className="default-avatar">{user.username.charAt(0).toUpperCase()}</div>
                          )}
                        </div>
                        <div className="friend-details">
                          <h4>{user.username}</h4>
                          <p>{user.email}</p>
                        </div>
                      </div>
                      <div className="friend-actions">
                        {isFriend ? (
                          <button 
                            className="action-button disabled" 
                            disabled
                            title="Zaten Arkadaşsınız"
                          >
                            Arkadaş
                          </button>
                        ) : hasPendingRequest ? (
                          <div className="action-buttons">
                            <button 
                              className="action-button accept" 
                              onClick={() => handleAcceptRequest(
                                pendingRequests.find(req => req.sender.id === user.id).id
                              )}
                              title="Kabul Et"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              className="action-button reject" 
                              onClick={() => handleRejectRequest(
                                pendingRequests.find(req => req.sender.id === user.id).id
                              )}
                              title="Reddet"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : hasSentRequest ? (
                          <button 
                            className="action-button cancel" 
                            onClick={() => handleCancelRequest(
                              sentRequests.find(req => req.recipient.id === user.id).id
                            )}
                            title="İsteği İptal Et"
                          >
                            İstek Gönderildi
                          </button>
                        ) : (
                          <button 
                            className="action-button add" 
                            onClick={() => handleSendRequest(user.id)}
                            title="Arkadaşlık İsteği Gönder"
                          >
                            <FaUserPlus />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : searchTerm !== '' ? (
              <p className="no-results">Sonuç bulunamadı.</p>
            ) : (
              <p className="search-info">
                Kullanıcı adı veya e-posta ile arama yapabilirsiniz.
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="friends-container">
      <div className="friends-sidebar">
        <button 
          className={`tab-button ${activeTab === 'online' ? 'active' : ''}`}
          onClick={() => setActiveTab('online')}
        >
          Çevrimiçi
        </button>
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tümü
        </button>
        <button 
          className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Bekleyen
          {pendingRequests.length > 0 && <span className="badge">{pendingRequests.length}</span>}
        </button>
        <button 
          className={`tab-button ${activeTab === 'sent' ? 'active' : ''}`}
          onClick={() => setActiveTab('sent')}
        >
          Gönderilen
        </button>
        <button 
          className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => setActiveTab('add')}
        >
          Arkadaş Ekle
        </button>
      </div>
      
      <div className="friends-content">
        {isLoading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
};

export default FriendList;