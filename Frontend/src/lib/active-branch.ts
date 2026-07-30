import { storage } from "@/services/localstorage";

type BranchReference = {
  id: number;
};

export async function resolveActiveBranchId(
  branches: readonly BranchReference[] | null | undefined,
): Promise<number> {
  const availableBranches = branches ?? [];
  const storedBranchId = Number(await storage.get<number>("branch"));
  const storedBranch = availableBranches.find(
    (branch) => branch.id === storedBranchId,
  );

  if (storedBranch) return storedBranch.id;

  const fallbackBranchId = availableBranches[0]?.id ?? 0;
  if (fallbackBranchId) {
    await storage.set("branch", fallbackBranchId);
  } else {
    storage.remove("branch");
  }

  return fallbackBranchId;
}
