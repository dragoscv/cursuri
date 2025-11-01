import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FiList } from '../../icons/FeatherIconsExtended';
import { RequirementsFieldProps } from '@/types';
import { useTranslations } from 'next-intl';

const RequirementsField = ({ requirements, currentRequirement, onRequirementChange, onAddRequirement, onRemoveRequirement }: RequirementsFieldProps) => {
  const t = useTranslations('courses.fields');
  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
        <FiList className="text-[color:var(--ai-primary)]" /> {t('requirements.label')}
      </label>
      <div className="space-y-2 mb-3 min-h-[100px]">
        {requirements.length > 0 ? requirements.map((requirement, index) => (
          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var(--ai-card-bg)] transition-all">
            <p className="text-sm">{requirement}</p>
            <Button
              size="sm"
              color="danger"
              variant="light"
              isIconOnly
              onPress={() => onRemoveRequirement(requirement)}
              className="opacity-60 hover:opacity-100"
            >
              ✕
            </Button>
          </div>
        )) : (
          <div className="flex items-center justify-center h-[100px] border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
            <p className="text-sm text-[color:var(--ai-muted)] italic">{t('requirements.empty')}</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={t('requirements.placeholder')}
          variant="bordered"
          value={currentRequirement}
          onChange={onRequirementChange}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onAddRequirement()}
          className="bg-[color:var(--ai-card-bg)]/40"
          startContent={<FiList className="text-[color:var(--ai-muted)]" size={16} />}
        />
        <Button
          color="primary"
          onPress={onAddRequirement}
          className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
        >
          {t('requirements.add')}
        </Button>
      </div>
    </div>
  );
};

export default RequirementsField;
