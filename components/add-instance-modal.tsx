import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";  // ✅ Correct import!

interface WebSocketMessage {
  type: "qr" | "status" | "error";
  qr?: string;
  session_name?: string;
  status?: string;
  message?: string;
}

interface AddInstanceModalProps {
  onAddInstance: (newInstance: { id: string; session_name: string; status: string; created_at: Date }) => void;
  onClose: () => void;
}

export function AddInstanceModal({ onAddInstance, onClose }: AddInstanceModalProps) {
  const [sessionName, setSessionName] = useState<string>("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (socket) {
      socket.onmessage = (event) => {
        const data: WebSocketMessage = JSON.parse(event.data);

        if (data.type === "qr" && data.qr) {
          setQrCode(data.qr);
        } else if (data.type === "status" && data.status) {
          setStatus(data.status);

          if (data.status === "connected") {
            onAddInstance({
              id: Date.now().toString(),
              session_name: sessionName,
              status: "connected",
              created_at: new Date(),
            });
            socket.close();
          }
        } else if (data.type === "error" && data.message) {
          alert(`Error: ${data.message}`);
          socket.close();
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [socket, sessionName, onAddInstance]);

  const handleAdd = () => {
    if (!sessionName.trim()) {
      alert("Session name is required!");
      return;
    }

    const ws = new WebSocket("ws://localhost:8000/api/v1/wa_instance/create");

    ws.onopen = () => {
      ws.send(JSON.stringify({ session_name: sessionName }));
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      alert("WebSocket connection error!");
    };

    setSocket(ws);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Instance</DialogTitle>
        </DialogHeader>

        <Input
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          placeholder="Session Name"
        />

        {qrCode && (
          <div className="flex flex-col items-center mt-4">
            <h3 className="text-lg font-medium">Scan QR Code:</h3>
            <QRCodeCanvas value={qrCode} size={250} />  {/* ✅ Correct Component! */}
          </div>
        )}

        {status && <p className="text-sm text-gray-500 mt-2">Status: {status}</p>}

        <DialogFooter>
          <Button onClick={handleAdd}>Add</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}