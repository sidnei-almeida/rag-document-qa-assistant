import { useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import SuggestedPrompts from './SuggestedPrompts';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import MessageComposer from './MessageComposer';
import UploadHero from './UploadHero';
import { toDisplayMessage, withAssistantGrouping } from '../../lib/conversations';
const WORKSPACE_PROMPTS = [
  'Summarize this workspace.',
  'What are the key points across these documents?',
  'What are the main risks or limitations?',
  'Compare the documents in this workspace.',
  'Which document supports the answer?',
];

export default function ChatPanel({
  messages,
  activeWorkspace,
  workspaceDetail,
  documentCount,
  isAssistantTyping,
  onSendMessage,
  onClearConversation,
  onUploadFiles,
  uploadState,
  isUploading,
  uploadDisabled,
  showSuggestions,
  canChat,
  apiStatus,
  apiLatency,
  onRetryHealthCheck,
}) {
  const messagesEndRef = useRef(null);
  const composerDisabled = !canChat || isAssistantTyping;
  const visibleMessages = messages.filter((m) => m.role !== 'system');
  const isEmpty = visibleMessages.length === 0 && !isAssistantTyping;
  const showUploadHero = !activeWorkspace;

  const displayMessages = isAssistantTyping
    ? [
        ...visibleMessages,
        {
          id: 'typing',
          role: 'typing',
          content: '',
          createdAt: new Date().toISOString(),
        },
      ]
    : visibleMessages;

  const mappedMessages = withAssistantGrouping(
    displayMessages.map((msg) => (msg.role === 'typing' ? msg : toDisplayMessage(msg))),
  );

  const workspaceId = activeWorkspace?.workspace_id ?? null;
  const centerEmptyContent = showUploadHero || isEmpty;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [workspaceId, mappedMessages.length, isAssistantTyping]);

  return (
    <div className="chat-panel">
      <ChatHeader
        activeWorkspace={activeWorkspace}
        workspaceDetail={workspaceDetail}
        apiStatus={apiStatus}
        apiLatency={apiLatency}
        onRetryHealthCheck={onRetryHealthCheck}
        onClearConversation={onClearConversation}
      />

      <div className="chat-panel__messages" role="log" aria-live="polite">
        <div
          className={`chat-panel__messages-inner chat-thread${
            centerEmptyContent ? ' chat-panel__messages-inner--center' : ''
          }`}
        >
          {showUploadHero ? (
            <UploadHero
              onUpload={onUploadFiles}
              uploadState={uploadState}
              isUploading={isUploading}
              disabled={uploadDisabled}
            />
          ) : isEmpty ? (
            <div className="chat-empty-doc">
              <MessageSquare size={32} className="chat-empty-doc__icon" />
              <h3 className="chat-empty-doc__title">Ask anything about this workspace</h3>
              <p className="chat-empty-doc__desc">
                DocMind will retrieve evidence only from the documents uploaded in this
                workspace.
              </p>
              {documentCount > 1 && (
                <p className="chat-empty-doc__desc chat-empty-doc__desc--muted">
                  This workspace contains {documentCount} documents.
                </p>
              )}
              {showSuggestions && canChat && (
                <SuggestedPrompts
                  onSelect={onSendMessage}
                  disabled={composerDisabled}
                  prompts={WORKSPACE_PROMPTS}
                />
              )}
            </div>
          ) : (
            <>
              {mappedMessages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  showAssistantIdentity={msg.showAssistantIdentity}
                />
              ))}
              {showSuggestions && canChat && visibleMessages.length <= 2 && (
                <SuggestedPrompts
                  onSelect={onSendMessage}
                  disabled={composerDisabled}
                  prompts={WORKSPACE_PROMPTS}
                />
              )}
            </>
          )}
          <div ref={messagesEndRef} className="chat-panel__messages-anchor" aria-hidden />
        </div>
      </div>

      <MessageComposer
        onSend={onSendMessage}
        disabled={!canChat}
        loading={isAssistantTyping}
        placeholder={
          !activeWorkspace
            ? 'Upload PDFs to start asking questions…'
            : 'Ask a question about this workspace...'
        }
      />
    </div>
  );
}
