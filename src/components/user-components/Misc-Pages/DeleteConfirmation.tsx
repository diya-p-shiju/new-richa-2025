import { Button } from "@/components/ui/button";

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  departmentName: string;
};

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  departmentName,
}: ConfirmDeleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">
          Are you sure you want to delete "{departmentName}"?
        </h2>
        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} className="bg-gray-500 text-white">
            No
          </Button>
          <Button onClick={onConfirm} className="bg-red-500 text-white">
            Yes, Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
