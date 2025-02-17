import { useSolutionList } from '@/contexts/SolutionListContext';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandInput, CommandList } from '@/components/ui/command';

export const SolutionList = () => {
  const { isLoading, solutions, setActiveSolutionId } = useSolutionList();

  console.log('SolutionList render:', {
    isLoading,
    solutions,
    isSolutionsArray: Array.isArray(solutions),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!solutions) {
    return <div>No solutions data available</div>;
  }

  return (
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Search solutions..." />
      <CommandList>
        <CommandEmpty>No solutions found.</CommandEmpty>
        <CommandGroup heading="Available Solutions">
          {solutions.map((solution) => (
            <CommandItem key={solution.id} onSelect={() => setActiveSolutionId(solution.id)} className="cursor-pointer">
              <span>Solution {solution.id}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};
