import { Activity } from 'lucide-react';
import IntelligenceMetricsGrid from '../intelligence/IntelligenceMetricsGrid';
import PanelSectionLabel from '../intelligence/PanelSectionLabel';
import WorkspaceConfig from '../intelligence/WorkspaceConfig';
import WorkspaceDocuments from '../intelligence/WorkspaceDocuments';
import LastAnswerSources from '../intelligence/LastAnswerSources';

export default function RightPanel({
  activeWorkspace,
  workspaceDetail,
  lastSources,
  lastConfidence,
  apiHealth,
  lastLatencyMs,
  onDeleteDocument,
  deletingDocumentId,
}) {
  const documents = workspaceDetail?.documents ?? [];
  const docCount = activeWorkspace?.document_count ?? documents.length ?? 0;
  const chunks = activeWorkspace?.total_chunks ?? '—';

  return (
    <aside className="right-panel">
      <div className="right-panel__scroll">
        <header className="right-panel__header">
          <div className="right-panel__title-row">
            <Activity
              size={12}
              strokeWidth={1.75}
              className="right-panel__title-icon"
              aria-hidden
            />
            <h2 className="right-panel__title">Workspace Intelligence</h2>
          </div>
        </header>

        {!activeWorkspace ? (
          <p className="panel-empty panel-empty--muted">Select a workspace to view intelligence.</p>
        ) : (
          <>
            <IntelligenceMetricsGrid
              docCount={docCount}
              chunks={chunks}
              lastLatencyMs={lastLatencyMs}
              lastConfidence={lastConfidence}
            />

            <section
              className="right-panel__section right-panel__section--stack"
              aria-labelledby="intel-config-heading"
            >
              <PanelSectionLabel id="intel-config-heading">Retrieval stack</PanelSectionLabel>
              <WorkspaceConfig workspaceDetail={workspaceDetail} apiHealth={apiHealth} />
            </section>

            <section
              className="right-panel__section right-panel__section--docs"
              aria-labelledby="intel-docs-heading"
            >
              <PanelSectionLabel id="intel-docs-heading">Documents</PanelSectionLabel>
              <WorkspaceDocuments
                workspaceId={activeWorkspace.workspace_id}
                documents={documents}
                onDeleteDocument={onDeleteDocument}
                deletingDocumentId={deletingDocumentId}
              />
            </section>

            <section
              className="right-panel__section right-panel__section--evidence right-panel__section--last"
              aria-labelledby="intel-sources-heading"
            >
              <PanelSectionLabel id="intel-sources-heading">Retrieved evidence</PanelSectionLabel>
              <LastAnswerSources sources={lastSources ?? []} />
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
