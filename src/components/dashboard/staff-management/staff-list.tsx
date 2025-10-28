import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Mail,
  MoreVertical,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import type { StaffListProps } from "./types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export function StaffList({ staffMembers, onEdit, onDelete, onResendInvite }: StaffListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<string | null>(null);
  const [staffNameToDelete, setStaffNameToDelete] = useState<string>("");

  const handleDeleteClick = (staffId: string, staffName: string) => {
    setStaffToDelete(staffId);
    setStaffNameToDelete(staffName);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (staffToDelete && onDelete) {
      onDelete(staffToDelete);
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
      setStaffNameToDelete("");
    }
  };
  const getStatusStyles = (status: string) => {
    if (status === "active") {
      return {
        bg: "bg-purple-50",
        text: "text-purple-700",
        icon: UserCheck,
      };
    } else {
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: UserX,
      };
    }
  };

  return (
    <div className="space-y-4">
      {staffMembers.map((staff) => {
        const statusStyles = getStatusStyles(staff.status);
        const StatusIcon = statusStyles.icon;

        return (
          <Card
            key={staff.id}
            className="bg-white border border-gray-200 hover:border-primary/20 transition-all duration-200 rounded-lg overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-base text-gray-900">
                      {staff.firstName} {staff.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{staff.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge className="bg-purple-100 text-purple-700 border-none px-3 py-1.5 text-sm font-semibold">
                    {staff.appRole?.name || 'No Role Assigned'}
                  </Badge>

                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium capitalize">
                      {staff.status}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm" className="p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => onEdit && onEdit(staff)}
                      >
                        <Edit className="h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer flex items-center gap-2"
                        onClick={() => onResendInvite && onResendInvite(staff.id, `${staff.firstName} ${staff.lastName}`)}
                      >
                        <Mail className="h-4 w-4" /> Resend Invite
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600 flex items-center gap-2"
                        onClick={() => handleDeleteClick(staff.id, `${staff.firstName} ${staff.lastName}`)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{staffNameToDelete}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
