import { FileType, RefreshCw, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import {
  formatChatHeaderBreadcrumb,
  formatChatHeaderTitle,
} from '../../lib/chatHeaderMeta';
import { API_STATUS } from '../../utils/constants';

function ApiStatusBadge({ apiStatus }) {
  if (apiStatus === API_STATUS.CHECKING) {
    return (
      <span className="chat-header__api-badge chat-header__api-badge--neutral">
        <span className="chat-header__api-badge-dot" aria-hidden />
        Checking API
      </span>
    );
  }

  if (apiStatus === API_STATUS.ERROR) {
    return (
      <span className="chat-header__api-badge chat-header__api-badge--error">
        <span className="chat-header__api-badge-dot" aria-hidden />
        API Error
      </span>
    );
  }

  return (
    <span className="chat-header__api-badge chat-header__api-badge--ready">
      <span className="chat-header__api-badge-dot" aria-hidden />
      API Ready
    </span>
  );
}

export default function ChatHeader({
  activeWorkspace,
  workspaceDetail,
  apiStatus,
  apiLatency,
  onRetryHealthCheck,
  onClearConversation,
}) {
  const title = formatChatHeaderTitle(activeWorkspace, workspaceDetail);
  const breadcrumb =
    activeWorkspace && formatChatHeaderBreadcrumb(activeWorkspace, workspaceDetail);

  return (
    <header className="chat-header">
      <div className="chat-header__left">
        {activeWorkspace && (
          <FileType
            className="chat-header__file-icon"
            size={13}
            strokeWidth={1.75}
            aria-hidden
          />
        )}
        <div className="chat-header__info">
          <h1 className="chat-header__title" title={title}>
            {title}
          </h1>
          {breadcrumb ? (
            <p className="chat-header__breadcrumb">
              <span className="chat-header__breadcrumb-id">{breadcrumb.workspaceIdLabel}</span>
              {breadcrumb.segments.length > 0 && (
                <>
                  <span className="chat-header__breadcrumb-sep" aria-hidden>
                    {' · '}
                  </span>
                  <span className="chat-header__breadcrumb-rest">
                    {breadcrumb.segments.join(' · ')}
                  </span>
                </>
              )}
              {activeWorkspace?.status === 'processing' && (
                <>
                  <span className="chat-header__breadcrumb-sep" aria-hidden>
                    {' · '}
                  </span>
                  <span className="chat-header__meta-processing">Indexing…</span>
                </>
              )}
            </p>
          ) : activeWorkspace?.status === 'processing' ? (
            <p className="chat-header__breadcrumb">
              <span className="chat-header__meta-processing">Indexing…</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className="chat-header__center" aria-hidden />

      <div className="chat-header__right">
        <div className="chat-header__status">
          <ApiStatusBadge apiStatus={apiStatus} />
          {apiLatency && apiStatus === API_STATUS.READY && (
            <span className="chat-header__latency">{apiLatency}</span>
          )}
        </div>

        <span className="chat-header__divider" aria-hidden />

        <div className="chat-header__tools">
          <button
            type="button"
            className={clsx(
              'chat-header__icon-btn',
              apiStatus === API_STATUS.CHECKING && 'chat-header__icon-btn--spin',
            )}
            onClick={onRetryHealthCheck}
            aria-label="Retry health check"
            title="Retry health check"
          >
            <RefreshCw size={15} strokeWidth={1.75} />
          </button>
          {activeWorkspace && (
            <button
              type="button"
              className="chat-header__icon-btn chat-header__icon-btn--delete"
              onClick={onClearConversation}
              aria-label="Clear conversation for this workspace"
              title="Clear conversation"
            >
              <Trash2 size={15} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
