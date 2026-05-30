import { ThumbsDown, ThumbsUp } from 'lucide-react';
import clsx from 'clsx';
import CitationList from './CitationList';
import MessageContent from './MessageContent';
import ModelAvatar from '../ui/ModelAvatar';
import { ASSISTANT_DISPLAY_NAME, getUserChatProfile } from '../../lib/chatAvatars';
import { formatMessageTime } from '../../utils/formatters';

function AssistantAvatar() {
  return (
    <ModelAvatar
      size={57}
      className="chat-message__avatar-assistant assistant-avatar"
      alt=""
    />
  );
}

function UserAvatar() {
  const { initials, avatarUrl } = getUserChatProfile();

  return (
    <span className="chat-message__avatar chat-message__avatar--user" aria-hidden>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="chat-message__avatar-img chat-message__avatar-img--user"
          width={28}
          height={28}
          draggable={false}
        />
      ) : (
        <span className="chat-message__avatar-initial">{initials}</span>
      )}
    </span>
  );
}

export default function ChatMessage({ message, showAssistantIdentity = true }) {
  const isUser = message.role === 'user';
  const isTyping = message.role === 'typing';

  if (isUser) {
    return (
      <article className="chat-message chat-message--user">
        <div className="user-message-row">
          <div className="chat-message__body chat-message__body--user">
            <div className="chat-message__bubble chat-message__bubble--user">
              <MessageContent content={message.content} className="chat-message__content" />
            </div>
            {message.timestamp && (
              <time className="chat-message__time" dateTime={message.timestamp}>
                {formatMessageTime(message.timestamp)}
              </time>
            )}
          </div>
          <UserAvatar />
        </div>
      </article>
    );
  }

  return (
    <article
      className={clsx(
        'chat-message',
        'chat-message--assistant',
        isTyping && 'chat-message--typing',
      )}
    >
      <div className="assistant-message-row">
        {showAssistantIdentity ? (
          <AssistantAvatar />
        ) : (
          <div className="chat-message__avatar-spacer" aria-hidden />
        )}

        <div className="assistant-message-column">
          {showAssistantIdentity && (
            <span className="chat-message__assistant-name">{ASSISTANT_DISPLAY_NAME}</span>
          )}

          <div className="assistant-message-body">
            {isTyping ? (
              <div className="chat-message__typing" aria-live="polite">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="chat-message__typing-text">Retrieving sources…</span>
              </div>
            ) : (
              <MessageContent content={message.content} className="chat-message__content" />
            )}
          </div>

          {!isTyping && (
            <div className="assistant-message-meta">
              {message.citations?.length > 0 && <CitationList citations={message.citations} />}

              <div className="chat-message__feedback">
                <button type="button" className="feedback-btn" aria-label="Helpful">
                  <ThumbsUp size={14} strokeWidth={1.75} />
                </button>
                <button type="button" className="feedback-btn" aria-label="Not helpful">
                  <ThumbsDown size={14} strokeWidth={1.75} />
                </button>
              </div>

              {message.timestamp && (
                <time className="chat-message__time" dateTime={message.timestamp}>
                  {formatMessageTime(message.timestamp)}
                </time>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
