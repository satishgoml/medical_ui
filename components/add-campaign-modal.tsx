import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AddCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (campaign: {
    id: string;
    name: string;
    data_file: File;
    media?: File[]; // Changed to File[] to accept multiple files
    message: string;
    phone_column: string;
    file_column_name?: string;
    created_at: Date;
    updated_at: Date;
  }) => void;
}

export function AddCampaignModal({ isOpen, onClose, onAdd }: AddCampaignModalProps) {
  const [name, setName] = useState("");
  const [data_file, setDataFile] = useState<File | undefined>(undefined);
  const [media, setMedia] = useState<File[]>([]); // Initialize as an empty array
  const [message, setMessage] = useState("");
  const [phoneColumn, setPhoneColumn] = useState("");
  const [fileColumnName, setFileColumnName] = useState("");

  const handleAdd = () => {
    if (!data_file) {
      alert("Data file is required");
      return;
    }

    const newCampaign = {
      id: Date.now().toString(),
      name,
      data_file,
      media: media.length > 0 ? media : undefined, // Only include media if files are selected
      message,
      phone_column: phoneColumn,
      file_column_name: fileColumnName,
      created_at: new Date(),
      updated_at: new Date(),
    };

    onAdd(newCampaign);
    onClose();
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to an array
      const filesArray = Array.from(e.target.files);
      setMedia(filesArray);
    } else {
      setMedia([]); // Clear the media if no files are selected
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Campaign</DialogTitle>
        </DialogHeader>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Campaign Name"
        />
        <Input
          type="file"
          onChange={(e) => setDataFile(e.target.files?.[0] || undefined)}
          placeholder="Data File Path"
        />
        <Input
          type="file"
          multiple // Added 'multiple' attribute to allow multiple file selection
          onChange={handleMediaChange} // Use the new handler
          placeholder="Media Files"
        />
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
        />
        <Input
          value={phoneColumn}
          onChange={(e) => setPhoneColumn(e.target.value)}
          placeholder="Phone Column"
        />
        <Input
          value={fileColumnName}
          onChange={(e) => setFileColumnName(e.target.value)}
          placeholder="File Column Name"
        />
        <DialogFooter>
          <Button onClick={handleAdd}>Add</Button>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}