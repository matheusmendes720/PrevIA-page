import { NotificationItem, NotificationSeverity } from '../types';

export interface NotificationEvent {
  type: 'new-notification';
  payload: NotificationItem;
}

export type NotificationSubscriber = (event: NotificationEvent) => void;

export interface NotificationService {
  fetchNotifications(): Promise<NotificationItem[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  ignoreNotification(id: string): Promise<void>;
  subscribe(subscriber: NotificationSubscriber): () => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'ntf-1001',
    type: 'critical',
    title: 'Falha de sincronização com SAP',
    description: 'Pedidos do último ciclo não foram importados. Verifique credenciais.',
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: 'ntf-1002',
    type: 'warning',
    title: 'Lead time acima do esperado',
    description: 'Fornecedor Gamma apresentou aumento de 18% no tempo médio.',
    timestamp: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: 'ntf-1003',
    type: 'info',
    title: 'Novo relatório disponível',
    description: 'Relatório de aderência de previsão semanal está pronto para revisão.',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
  },
  {
    id: 'ntf-1004',
    type: 'warning',
    title: 'Estoque abaixo do ponto de reposição',
    description: 'Item EPI-034 atingiu 91% do ponto mínimo. Avalie compra emergencial.',
    timestamp: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
  },
];

const notificationStore = new Map<string, NotificationItem>(
  INITIAL_NOTIFICATIONS.map((notification) => [notification.id, notification])
);

const subscribers = new Set<NotificationSubscriber>();

const randomMessages: Record<NotificationSeverity, { title: string; description: string }[]> = {
  critical: [
    {
      title: 'Cluster de servidores indisponível',
      description: 'Risco de perda de dados em 12 requisições pendentes. Acione a TI imediatamente.',
    },
    {
      title: 'Anomalia de demanda detectada',
      description: 'Diferença de 47% entre previsão e demanda real. Reavaliar alocação.',
    },
  ],
  warning: [
    {
      title: 'Entrega atrasada em 6 horas',
      description: 'Fornecedor Beta registrou atraso de remessa. Ajuste previsão de estoque.',
    },
    {
      title: 'Consumo acima do previsto',
      description: 'Linha de produção L-14 ultrapassou teto diário. Avalie replanejamento.',
    },
  ],
  info: [
    {
      title: 'Atualização de dashboard',
      description: 'Nova visualização de inventário inteligente disponível para testes.',
    },
    {
      title: 'Integração concluída',
      description: 'Canal de dados com o data lake foi sincronizado com sucesso.',
    },
  ],
};

function createRandomNotification(): NotificationItem {
  const severities: NotificationSeverity[] = ['critical', 'warning', 'info'];
  const severity = severities[Math.floor(Math.random() * severities.length)];
  const messages = randomMessages[severity];
  const { title, description } = messages[Math.floor(Math.random() * messages.length)];

  return {
      id: `ntf-${Date.now()}`,
      type: severity,
      title,
      description,
      timestamp: new Date().toISOString(),
  };
}

const notificationService: NotificationService = {
  async fetchNotifications() {
    await new Promise((resolve) => setTimeout(resolve, 480));
    return Array.from(notificationStore.values()).sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },
  async markAsRead(id: string) {
    const notification = notificationStore.get(id);
    if (!notification) return;
    notificationStore.set(id, { ...notification, isRead: true });
  },
  async markAllAsRead() {
    notificationStore.forEach((notification, id) => {
      notificationStore.set(id, { ...notification, isRead: true });
    });
  },
  async ignoreNotification(id: string) {
    notificationStore.delete(id);
  },
  subscribe(callback: NotificationSubscriber) {
    subscribers.add(callback);

    let intervalId: number | null = null;
    if (typeof window !== 'undefined') {
      intervalId = window.setInterval(() => {
        const shouldEmit = Math.random() > 0.6;
        if (!shouldEmit) return;

        const notification = createRandomNotification();
        notificationStore.set(notification.id, notification);
        subscribers.forEach((subscriber) =>
          subscriber({ type: 'new-notification', payload: notification })
        );
      }, 1000 * 60 * 3);
    }

    return () => {
      subscribers.delete(callback);
      if (intervalId !== null && typeof window !== 'undefined') {
        window.clearInterval(intervalId);
      }
    };
  },
};

export default notificationService;
