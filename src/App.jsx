import { useCallback, useState } from 'react';
import AppShell from './components/layout/AppShell';
import Sidebar from './components/layout/Sidebar';
import RightPanel from './components/layout/RightPanel';
import ChatPanel from './components/chat/ChatPanel';
import LoadingScreen from './components/LoadingScreen';
import { API_STATUS } from './utils/constants';
import { useApiStatus } from './hooks/useApiStatus';
import { useWorkspaces } from './hooks/useWorkspaces';
import { countUserFacingMessages } from './lib/conversations';
import { API_BASE_URL } from './lib/api';

function AppContent() {
  const api = useApiStatus();
  const ws = useWorkspaces();

  const connectionStatus =
    api.connectionStatus === 'checking'
      ? API_STATUS.CHECKING
      : api.connectionStatus === 'ready'
        ? API_STATUS.READY
        : API_STATUS.ERROR;

  const canChat = Boolean(
    ws.activeWorkspace?.index_ready || ws.activeWorkspace?.status === 'ready',
  );

  const userFacingCount = countUserFacingMessages(ws.activeMessages);
  const showSuggestions =
    Boolean(ws.activeWorkspace) && userFacingCount === 0;

  const apiReady = api.connectionStatus === 'ready';
  const bannerMessage = api.errorMessage || ws.workspacesError;

  const handleSend = async (text) => {
    try {
      await ws.sendMessage(text);
      api.setErrorMessage(null);
    } catch (err) {
      api.setErrorMessage(err instanceof Error ? err.message : 'Request failed');
    }
  };

  const documentCount =
    ws.activeWorkspaceDetail?.document_count ??
    ws.activeWorkspace?.document_count ??
    0;

  return (
    <AppShell
      sidebar={
        <Sidebar
          workspaces={ws.workspaces}
          activeWorkspaceId={ws.activeWorkspaceId}
          onSelectWorkspace={ws.selectWorkspace}
          onUploadFiles={ws.uploadFiles}
          onDeleteWorkspace={ws.deleteWorkspace}
          uploadState={ws.uploadState}
          onUploadDraggingChange={ws.setUploadDragging}
          isUploading={ws.isUploading}
          apiReady={apiReady}
          isLoadingWorkspaces={ws.isLoadingWorkspaces}
          getMessageCount={ws.getMessageCount}
          deletingWorkspaceId={ws.deletingWorkspaceId}
        />
      }
      main={
        <div className="main-column">
          {bannerMessage && (
            <div className="app-banner app-banner--error" role="alert">
              {bannerMessage}
            </div>
          )}
          <ChatPanel
            messages={ws.activeMessages}
            activeWorkspace={ws.activeWorkspace}
            workspaceDetail={ws.activeWorkspaceDetail}
            documentCount={documentCount}
            isAssistantTyping={ws.isAssistantTyping}
            onSendMessage={handleSend}
            onClearConversation={() => ws.clearConversation()}
            onUploadFiles={ws.uploadFiles}
            uploadState={ws.uploadState}
            isUploading={ws.isUploading}
            uploadDisabled={!apiReady}
            showSuggestions={showSuggestions}
            canChat={canChat}
            apiStatus={connectionStatus}
            apiLatency={api.apiLatency}
            onRetryHealthCheck={api.refresh}
          />
        </div>
      }
      rightPanel={
        <RightPanel
          activeWorkspace={ws.activeWorkspace}
          workspaceDetail={ws.activeWorkspaceDetail}
          lastSources={ws.activeLastSources}
          lastConfidence={ws.activeLastConfidence}
          apiHealth={api.apiHealth}
          lastLatencyMs={ws.activeLastLatencyMs}
          onDeleteDocument={ws.deleteDocument}
          deletingDocumentId={ws.deletingDocumentId}
        />
      }
    />
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashReady = useCallback(() => {
    setSplashDone(true);
  }, []);

  if (!splashDone) {
    return (
      <LoadingScreen
        apiHealthUrl={`${API_BASE_URL}/health`}
        onReady={handleSplashReady}
      />
    );
  }

  return <AppContent />;
}
