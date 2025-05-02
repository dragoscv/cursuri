import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import { FiTag } from '../../icons/FeatherIconsExtended';
import { TagsFieldProps } from '@/types';

const TagsField = ({ tags, currentTag, onTagChange, onAddTag, onRemoveTag }: TagsFieldProps) => {
  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
        <FiTag className="text-[color:var(--ai-primary)]" /> Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-2 rounded-lg border border-[color:var(--ai-card-border)]/50">
        {tags.length > 0 ? tags.map((tag) => (
          <Chip
            key={tag}
            onClose={() => onRemoveTag(tag)}
            variant="flat"
            color="primary"
            className="bg-gradient-to-r from-[color:var(--ai-primary)]/10 to-[color:var(--ai-secondary)]/10 border-none"
            classNames={{ content: "font-medium" }}
          >
            {tag}
          </Chip>
        )) : (
          <p className="text-sm text-[color:var(--ai-muted)] italic">No tags added yet</p>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="Add a tag"
          variant="bordered"
          value={currentTag}
          onChange={onTagChange}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onAddTag()}
          className="bg-[color:var(--ai-card-bg)]/40"
          startContent={<FiTag className="text-[color:var(--ai-muted)]" size={16} />}
        />
        <Button
          color="primary"
          onPress={onAddTag}
          className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export default TagsField;
