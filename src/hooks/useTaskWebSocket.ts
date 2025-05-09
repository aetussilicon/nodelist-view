// src/hooks/useTaskWebSocket.ts
import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client, over, Frame } from "stompjs";
import type { TaskProps } from "../interfaces/TaskProps";

type Callback = (updated: TaskProps) => void;

export function useTaskWebSocket(onTaskUpdate: Callback) {
  const clientRef = useRef<Client | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    const socket = new SockJS("http://100.77.191.127:8080/websocket");
    const stompClient = over(socket);
    clientRef.current = stompClient;

    // Quando conectar, marcamos que está OK
    stompClient.connect(
      {},
      (frame?: Frame) => {
        connectedRef.current = true;
        stompClient.subscribe("/topic/tasks", (msg) => {
          const updated: TaskProps = JSON.parse(msg.body);
          onTaskUpdate(updated);
        });
      },
      (error) => {
        console.error("STOMP connect error:", error);
      }
    );

    return () => {
      // Só desconecta se já tiver conectado
      if (clientRef.current && connectedRef.current) {
        try {
          // Verificar o estado da conexão usando a propriedade connected de stompjs
          if (clientRef.current.connected) {
            clientRef.current.disconnect(
              () => {
                console.log("WebSocket desconectado com sucesso.");
              },
              {}
            );
          } else {
            console.log("WebSocket ainda não estava conectado. Abortando desconexão.");
          }
        } catch (err) {
          console.error("Erro ao desconectar WebSocket:", err);
        }
      }
    };
  }, [onTaskUpdate]);
}
