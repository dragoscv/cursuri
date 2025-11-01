import Button from '@/components/ui/Button';
import { FiImage } from '../../icons/FeatherIconsExtended';
import { CourseImageFieldProps } from '@/types';
import { useTranslations } from 'next-intl';

export default function CourseImageField({ imagePreview, onImageChange, onRemoveImage }: CourseImageFieldProps) {
    const t = useTranslations('courses.fields');
    return (
        <div className="mb-6">
            <label className="text-sm font-medium text-[color:var(--ai-foreground)] mb-2 flex items-center gap-2">
                <FiImage className="text-[color:var(--ai-primary)]" /> {t('image.label')}
            </label>
            <div className="border-2 border-dashed border-[color:var(--ai-card-border)] rounded-xl p-4 text-center cursor-pointer hover:bg-[color:var(--ai-card-bg)]/50 transition-all hover:border-[color:var(--ai-primary)]/30 hover:shadow-lg">
                {imagePreview ? (
                    <div className="relative group">
                        <img
                            src={imagePreview}
                            alt={t('image.preview')}
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg pointer-events-none">
                            <Button
                                color="danger"
                                variant="flat"
                                size="sm"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
                                onPress={onRemoveImage}
                            >
                                {t('image.remove')}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[color:var(--ai-primary)]/20 to-[color:var(--ai-secondary)]/20 flex items-center justify-center">
                            <FiImage size={24} className="text-[color:var(--ai-primary)]" />
                        </div>
                        <p className="mt-3 text-sm font-medium text-[color:var(--ai-foreground)]">{t('image.upload')}</p>
                        <p className="text-xs text-[color:var(--ai-muted)] mt-1">{t('image.formats')}</p>
                        <input
                            type="file"
                            className="hidden"
                            onChange={onImageChange}
                            accept="image/*"
                        />
                    </label>
                )}
            </div>
        </div>
    );
}
