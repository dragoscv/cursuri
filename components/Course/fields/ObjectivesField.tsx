import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { FiTarget } from '../../icons/FeatherIconsExtended';
import { ObjectivesFieldProps } from '@/types';
import { useTranslations } from 'next-intl';

const ObjectivesField = ({ objectives, currentObjective, onObjectiveChange, onAddObjective, onRemoveObjective }: ObjectivesFieldProps) => {
  const t = useTranslations('courses.fields');
  return (
    <div className="mb-6">
      <label className="flex items-center gap-2 text-sm font-medium text-[color:var(--ai-foreground)] mb-3">
        <FiTarget className="text-[color:var(--ai-primary)]" /> {t('objectives.label')}
      </label>
      <div className="space-y-2 mb-3 min-h-[100px]">
        {objectives.length > 0 ? objectives.map((objective, index) => (
          <div key={index} className="flex justify-between items-center p-3 rounded-lg bg-[color:var(--ai-card-bg)]/50 border border-[color:var(--ai-card-border)]/50 hover:border-[color:var(--ai-primary)]/20 hover:bg-[color:var(--ai-card-bg)] transition-all">
            <p className="text-sm">{objective}</p>
            <Button
              size="sm"
              color="danger"
              variant="light"
              isIconOnly
              onPress={() => onRemoveObjective(objective)}
              className="opacity-60 hover:opacity-100"
            >
              ✕
            </Button>
          </div>
        )) : (
          <div className="flex items-center justify-center h-[100px] border border-dashed border-[color:var(--ai-card-border)] rounded-lg">
            <p className="text-sm text-[color:var(--ai-muted)] italic">{t('objectives.empty')}</p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder={t('objectives.placeholder')}
          variant="bordered"
          value={currentObjective}
          onChange={onObjectiveChange}
          onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && onAddObjective()}
          className="bg-[color:var(--ai-card-bg)]/40"
          startContent={<FiTarget className="text-[color:var(--ai-muted)]" size={16} />}
        />
        <Button
          color="primary"
          onPress={onAddObjective}
          className="bg-gradient-to-r from-[color:var(--ai-primary)] to-[color:var(--ai-secondary)]"
        >
          {t('objectives.add')}
        </Button>
      </div>
    </div>
  );
};

export default ObjectivesField;
