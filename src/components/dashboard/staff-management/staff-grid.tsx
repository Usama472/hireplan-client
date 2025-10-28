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
import type { StaffGridProps } from "./types";
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

export function StaffGrid({ staffMembers, onEdit, onDelete, onResendInvite }: StaffGridProps) {
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
        bg: "bg-green-50",
        text: "text-green-700",
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {staffMembers.map((staff) => {
        const statusStyles = getStatusStyles(staff.status);
        const StatusIcon = statusStyles.icon;

        return (
          <Card
            key={staff.id}
            className="bg-white border border-gray-200 hover:border-primary/20 transition-all duration-200 rounded-lg overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                {/* Header with role badge */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <Badge className="bg-purple-100 text-purple-700 border-none px-3 py-1.5 text-sm font-semibold">
                    {staff.appRole?.name || 'No Role Assigned'}
                  </Badge>

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

                {/* Staff info */}
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-medium text-lg text-gray-900 mb-1">
                    {staff.firstName} {staff.lastName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">{staff.email}</p>

                  {/* Role and Status */}
                  <div className="mt-auto space-y-2">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Company Role:</span> {staff.companyRole || 'N/A'}
                    </div>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium capitalize">
                        {staff.status}
                      </span>
                    </div>
                  </div>
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
