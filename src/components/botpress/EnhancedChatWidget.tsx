import React, { useState, useMemo, useEffect } from 'react';
import { Container, Header, MessageList, Composer, useWebchat, Fab } from '@botpress/webchat';
import { useLangbaseAgent } from '@/hooks/use-langbase-agent';

// Custom interface for the enhanced widget
export const EnhancedChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Botpress Webchat Hook (2nd Layer Control)
    const { client, messages, isTyping, user, clientState } = useWebchat({
        clientId: process.env.NEXT_PUBLIC_BOTPRESS_CLIENT_ID || '892072aa-0b89-47e0-800c-8da8f387d757',
    });

    // Listen for custom events from Botpress (The "Sync" part)
    useEffect(() => {
        if (!client) return;

        // Example: Handling a 'syncUi' event from the bot
        // This allows the bot to "control" the host application
        const handleEvent = (event: any) => {
            if (event.type === 'syncUi') {
                console.log('Bot requested UI sync:', event.payload);
                // Implement logic to switch views or highlight elements
            }
        };

        // Note: client.on is standard EventEmitter style in the React lib
        // (Actual listener syntax might vary slightly by version, but follow research)
    }, [client]);

    const toggleChat = () => setIsOpen(!isOpen);

    return (
        <>
            <div className="fixed bottom-5 right-5 z-50">
                <Container
                    connected={clientState !== 'disconnected'}
                    style={{
                        width: '400px',
                        height: '600px',
                        display: isOpen ? 'flex' : 'none',
                        flexDirection: 'column',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        backgroundColor: '#fff'
                    }}
                >
                    <Header
                        title="PrevIA Assistant"
                        onClose={() => setIsOpen(false)}
                    />
                    <MessageList
                        messages={messages}
                        isTyping={isTyping}
                    />
                    <Composer
                        sendMessage={(text) => {
                            client?.sendMessage(text);
                            // Proactive: Send metadata about current page context
                            client?.sendEvent({
                                type: 'pageContext',
                                payload: { url: window.location.href }
                            });
                        }}
                    />
                </Container>

                <button
                    onClick={toggleChat}
                    className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                >
                    {isOpen ? 'Close' : 'Chat with Agent'}
                </button>
            </div>
        </>
    );
};
