import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import styles from './NotificationBell.module.css';
import {
  BellIcon,
  ExclamationTriangleIcon,
  InfoIcon,
  CheckCircleIcon,
  EyeIcon,
  TrashIcon,
  SpinnerIcon,
} from './icons';
import { NotificationItem, NotificationSeverity } from '../types';
import notificationService, {
  NotificationEvent,
  NotificationService,
} from '../lib/notificationsService';

const severityOrder: NotificationSeverity[] = ['critical', 'warning', 'info'];

const severityMetadata: Record<NotificationSeverity, {
  label: string;
  tooltipLabel: string;
  previewClass: string;
  iconClass: string;
  icon: React.ReactNode;
}> = {
  critical: {
    label: 'Crítico',
    tooltipLabel: 'críticas',
    previewClass: styles.previewIconCritical,
    iconClass: styles.iconCritical,
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
  warning: {
    label: 'Aviso',
    tooltipLabel: 'de aviso',
    previewClass: styles.previewIconWarning,
    iconClass: styles.iconWarning,
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
  },
  info: {
    label: 'Informativo',
    tooltipLabel: 'informativas',
    previewClass: styles.previewIconInfo,
    iconClass: styles.iconInfo,
    icon: <InfoIcon className="w-4 h-4" />,
  },
};

const badgeSeverityClass: Record<NotificationSeverity, string> = {
  critical: styles.badgeCritical,
  warning: styles.badgeWarning,
  info: styles.badgeInfo,
};

const severityChipClass: Record<NotificationSeverity, string> = {
  critical: styles.stateCritical,
  warning: styles.stateWarning,
  info: styles.stateInfo,
};

const cx = (...classes: Array<string | false | null | undefined>): string =>
  classes.filter(Boolean).join(' ');

const sortNotifications = (items: NotificationItem[]) =>
  items
    .slice()
    .sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

const formatRelativeTime = (isoDate: string) => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return 'agora';
  if (minutes === 1) return 'há 1 minuto';
  if (minutes < 60) return `há ${minutes} minutos`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return 'há 1 hora';
  if (hours < 24) return `há ${hours} horas`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'há 1 dia';
  if (days < 7) return `há ${days} dias`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? 'há 1 semana' : `há ${weeks} semanas`;
};

const formatAbsoluteTime = (isoDate: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));

type NotificationBellProps = {
  theme?: 'light' | 'dark';
  service?: NotificationService;
  onViewDetails?: (notification: NotificationItem) => void;
};

const NotificationBell: React.FC<NotificationBellProps> = ({
  theme = 'dark',
  service = notificationService,
  onViewDetails,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewVisible, setPreviewVisible] = useState<boolean>(false);
  const [isTooltipVisible, setTooltipVisible] = useState<boolean>(false);
  const [isPanelOpen, setPanelOpen] = useState<boolean>(false);

  const tooltipId = useId();
  const dialogLabelId = useId();
  const dialogDescriptionId = useId();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    service
      .fetchNotifications()
      .then((initial) => {
        if (!isMounted) return;
        setNotifications(sortNotifications(initial));
        setError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Não foi possível carregar as notificações.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [service]);

  useEffect(() => {
    const unsubscribe = service.subscribe((event: NotificationEvent) => {
      if (event.type !== 'new-notification') return;
      setNotifications((prev) => sortNotifications([...prev, event.payload]));
    });

    return () => {
      unsubscribe?.();
    };
  }, [service]);

  useEffect(() => {
    if (!isPanelOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPanelOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPanelOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;
      if (!container.contains(event.target as Node)) {
        setPanelOpen(false);
        setPreviewVisible(false);
        setTooltipVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isPanelOpen) {
      setPreviewVisible(false);
      setTooltipVisible(false);
      const timeout = window.setTimeout(() => {
        panelRef.current?.focus();
      }, 10);
      return () => window.clearTimeout(timeout);
    }
    return undefined;
  }, [isPanelOpen]);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.isRead),
    [notifications]
  );

  const unreadCount = unreadNotifications.length;

  const highestSeverity = useMemo<NotificationSeverity | null>(() => {
    if (unreadNotifications.length === 0) return null;
    for (const severity of severityOrder) {
      if (unreadNotifications.some((notification) => notification.type === severity)) {
        return severity;
      }
    }
    return unreadNotifications[0]?.type ?? null;
  }, [unreadNotifications]);

  const badgeClassName = highestSeverity
    ? badgeSeverityClass[highestSeverity]
    : styles.badgeInfo;

  const previewNotifications = useMemo(
    () => notifications.slice(0, 3),
    [notifications]
  );

  const buttonLabel = unreadCount
    ? `${unreadCount} notificações não lidas`
    : 'Todas as notificações lidas';

  const tooltipText = unreadCount
    ? `${unreadCount} notificações ${highestSeverity ? severityMetadata[highestSeverity].tooltipLabel : 'pendentes'}`
    : 'Tudo em dia — nenhuma nova notificação';

  const handleMouseEnter = () => {
    if (isPanelOpen) return;
    setPreviewVisible(true);
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    if (isPanelOpen) return;
    setPreviewVisible(false);
    setTooltipVisible(false);
  };

  const handleButtonClick = () => {
    setPanelOpen((previous) => !previous);
    setPreviewVisible(false);
    setTooltipVisible(false);
  };

  const handleButtonFocus = () => {
    if (isPanelOpen) return;
    setPreviewVisible(true);
    setTooltipVisible(true);
  };

  const handleButtonBlur: React.FocusEventHandler<HTMLButtonElement> = (event) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (isPanelOpen) return;
    if (!nextTarget || !containerRef.current?.contains(nextTarget)) {
      setPreviewVisible(false);
      setTooltipVisible(false);
    }
  };

  const updateNotification = useCallback(
    (id: string, updater: (item: NotificationItem) => NotificationItem) => {
      setNotifications((prev) =>
        sortNotifications(prev.map((item) => (item.id === id ? updater(item) : item)))
      );
    },
    []
  );

  const handleMarkAsRead = async (id: string) => {
    updateNotification(id, (notification) => ({ ...notification, isRead: true }));
    try {
      await service.markAsRead(id);
    } catch (err) {
      console.error('Erro ao marcar notificação como lida', err);
    }
  };

  const handleIgnore = async (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    try {
      await service.ignoreNotification(id);
    } catch (err) {
      console.error('Erro ao ignorar notificação', err);
    }
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
    try {
      await service.markAllAsRead();
    } catch (err) {
      console.error('Erro ao marcar todas notificações', err);
    }
  };

  const handleViewDetails = (notification: NotificationItem) => {
    onViewDetails?.(notification);
  };

  return (
    <div
      ref={containerRef}
      className={styles.container}
      data-theme={theme}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={buttonLabel}
        aria-haspopup="dialog"
        aria-expanded={isPanelOpen}
        aria-describedby={isTooltipVisible ? tooltipId : undefined}
        onClick={handleButtonClick}
        onFocus={handleButtonFocus}
        onBlur={handleButtonBlur}
        className={cx(styles.button, unreadCount === 0 && styles.buttonMuted)}
      >
        <span className={styles.iconWrapper} aria-hidden="true">
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className={cx(styles.badge, badgeClassName)}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
        <span className={styles.srOnly}>{buttonLabel}</span>
      </button>

      <div
        id={tooltipId}
        role="tooltip"
        className={cx(styles.tooltip, isTooltipVisible && styles.tooltipVisible)}
      >
        {tooltipText}
      </div>

      <div
        className={cx(
          styles.previewPanel,
          isPreviewVisible && !isPanelOpen && !loading && styles.previewVisible
        )}
        role="region"
        aria-live="polite"
      >
        <div className={styles.previewHeader}>
          <span>Notificações recentes</span>
          {unreadCount > 0 && <span>{unreadCount} novas</span>}
        </div>
        <div className={styles.previewList}>
          {previewNotifications.map((notification) => {
            const metadata = severityMetadata[notification.type];
            return (
              <div
                key={notification.id}
                className={cx(
                  styles.previewItem,
                  notification.isRead && styles.previewItemRead
                )}
              >
                <span className={cx(styles.previewIcon, metadata.previewClass)}>
                  {metadata.icon}
                </span>
                <div className={styles.previewContent}>
                  <span className={styles.previewTitle}>{notification.title}</span>
                  <span className={styles.previewMeta}>
                    {formatRelativeTime(notification.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && !loading && (
            <div className={styles.previewItem}>
              <span className={cx(styles.previewIcon, styles.previewIconInfo)}>
                <CheckCircleIcon className="w-4 h-4" />
              </span>
              <div className={styles.previewContent}>
                <span className={styles.previewTitle}>Tudo em dia</span>
                <span className={styles.previewMeta}>
                  Nenhuma nova notificação disponível.
                </span>
              </div>
            </div>
          )}
          {loading && (
            <div className={styles.previewItem}>
              <span className={cx(styles.previewIcon, styles.previewIconInfo)}>
                <SpinnerIcon className="w-4 h-4" />
              </span>
              <div className={styles.previewContent}>
                <span className={styles.previewTitle}>Carregando notificações...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-labelledby={dialogLabelId}
        aria-describedby={dialogDescriptionId}
        className={cx(styles.panel, isPanelOpen && styles.panelOpen)}
      >
        <div className={styles.panelHeader}>
          <div className={styles.panelTitleGroup}>
            <span id={dialogLabelId} className={styles.panelTitle}>
              Central de notificações
            </span>
            <span id={dialogDescriptionId} className={styles.panelSubtitle}>
              {notifications.length} notificações totais — {unreadCount} não lidas
            </span>
          </div>
          <div className={styles.panelActions}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => {
                setPanelOpen(false);
                buttonRef.current?.focus();
              }}
            >
              Fechar
            </button>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={handleMarkAll}
              >
                Marcar tudo como lido
              </button>
            )}
          </div>
        </div>
        <div className={styles.responsiveDivider} />
        <div className={styles.panelBody} role="list">
          {loading && (
            <div className={styles.notificationItem} role="status">
              <span className={cx(styles.notificationIcon, styles.iconInfo)}>
                <SpinnerIcon className="w-5 h-5" />
              </span>
              <div className={styles.notificationContent}>
                <span className={styles.notificationTitle}>Carregando notificações…</span>
                <span className={styles.notificationDescription}>
                  Aguarde enquanto buscamos as atualizações mais recentes.
                </span>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className={styles.notificationItem} role="alert">
              <span className={cx(styles.notificationIcon, styles.iconWarning)}>
                <ExclamationTriangleIcon className="w-5 h-5" />
              </span>
              <div className={styles.notificationContent}>
                <span className={styles.notificationTitle}>Erro ao carregar</span>
                <span className={styles.notificationDescription}>{error}</span>
                <div className={styles.notificationActions}>
                  <button
                    type="button"
                    className={styles.notificationActionButton}
                    onClick={() => {
                      setLoading(true);
                      setError(null);
                      service
                        .fetchNotifications()
                        .then((fetched) => {
                          setNotifications(sortNotifications(fetched));
                          setError(null);
                        })
                        .catch(() => {
                          setError('Não foi possível carregar as notificações.');
                        })
                        .finally(() => setLoading(false));
                    }}
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className={styles.emptyState} role="status">
              <CheckCircleIcon className="w-5 h-5 mx-auto mb-2 text-brand-cyan" />
              Nenhuma notificação pendente no momento.
            </div>
          )}

          {!loading && !error &&
            notifications.map((notification) => {
              const metadata = severityMetadata[notification.type];
              return (
                <div
                  role="listitem"
                  key={notification.id}
                  className={cx(
                    styles.notificationItem,
                    notification.isRead && styles.notificationItemRead
                  )}
                >
                  <span className={cx(styles.notificationIcon, metadata.iconClass)}>
                    {metadata.icon}
                  </span>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationTitle}>{notification.title}</div>
                    <div className={styles.notificationDescription}>
                      {notification.description}
                    </div>
                    <div className={styles.notificationMeta}>
                      <span>{formatRelativeTime(notification.timestamp)}</span>
                      <span aria-hidden="true">•</span>
                      <span>{formatAbsoluteTime(notification.timestamp)}</span>
                      <span
                        className={cx(styles.notificationChip, severityChipClass[notification.type])}
                      >
                        {metadata.label}
                      </span>
                    </div>
                    <div className={styles.notificationActions}>
                      {!notification.isRead && (
                        <button
                          type="button"
                          className={styles.notificationActionButton}
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Marcar como lida
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.notificationActionButton}
                        onClick={() => handleViewDetails(notification)}
                      >
                        <EyeIcon className="w-4 h-4 mr-1 inline align-middle" /> Ver detalhes
                      </button>
                      <button
                        type="button"
                        className={styles.notificationActionButton}
                        onClick={() => handleIgnore(notification.id)}
                      >
                        <TrashIcon className="w-4 h-4 mr-1 inline align-middle" /> Ignorar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default NotificationBell;
