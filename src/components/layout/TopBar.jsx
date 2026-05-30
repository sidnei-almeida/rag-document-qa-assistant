import { FolderOpen, RefreshCw } from 'lucide-react';
import clsx from 'clsx';
import Badge from '../ui/Badge';
import { API_STATUS } from '../../utils/constants';

export default function TopBar({
  apiStatus,
  apiLatency,
  activeWorkspace,
  onRetryHealthCheck,
}) {
  const statusBadge = () => {
    if (apiStatus === API_STATUS.CHECKING) {
      return <Badge variant="checking" dot>Checking API</Badge>;
    }
    if (apiStatus === API_STATUS.ERROR) {
      return <Badge variant="error" dot>API Error</Badge>;
    }
    return (
      <Badge variant="ready" dot>
        API Ready{apiLatency ? ` · ${apiLatency}` : ''}
      </Badge>
    );
  };

  return (
    <header className="top-bar">
      <div className="top-bar__left">
        {activeWorkspace ? (
          <>
            <FolderOpen size={18} className="top-bar__doc-icon" />
            <div className="top-bar__doc-info">
              <span className="top-bar__doc-name">{activeWorkspace.title}</span>
              {activeWorkspace.status === 'processing' && (
                <span className="top-bar__processing">Processing…</span>
              )}
            </div>
          </>
        ) : (
          <span className="top-bar__placeholder">No workspace selected</span>
        )}
      </div>
      <div className="top-bar__right">
        {statusBadge()}
        <button
          type="button"
          className={clsx(
            'top-bar__refresh',
            apiStatus === API_STATUS.CHECKING && 'top-bar__refresh--spin',
          )}
          onClick={onRetryHealthCheck}
          aria-label="Retry health check"
          title="Retry health check"
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </header>
  );
}
