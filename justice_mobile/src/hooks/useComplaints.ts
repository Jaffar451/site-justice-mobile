import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";

export const useComplaints = () => {
  return useQuery({
    queryKey: ["complaints"],
    queryFn: async () => {
      const response = await api.get("/complaints");
      return response.data;
    },
  });
};

export const useUpdateComplaintStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, note }: { id: string, status: string, note?: string }) => {
      return api.patch(`/complaints/${id}/status`, { status, note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};