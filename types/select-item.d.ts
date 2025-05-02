// Add types for SelectItem 
import { ListboxItemBaseProps } from "@react-types/shared";

declare module '@heroui/react' {
    // Fix for the SelectItem component
    export interface SelectItemProps {
        key?: string;
        value?: string;  // Make value optional to avoid type errors
        textValue?: string; // Make textValue optional to avoid type errors
        className?: string;
        children?: React.ReactNode;
        isDisabled?: boolean;
        isReadOnly?: boolean;
    }

    // Fix for the component itself
    export const SelectItem: React.FC<ListboxItemBaseProps<object> & SelectItemProps>;
}
