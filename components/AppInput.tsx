import { Input, InputField } from '@/components/ui/input';

export function AppInput(props) {
  return (
    <Input variant="outline" size="lg" className="border-gray-300" {...props}>
      {/* If you want to always use a styled InputField, you can do: */}
      {props.children || (
        <InputField
          className="text-gray-800 placeholder:text-gray-500"
          {...props.inputFieldProps}
        />
      )}
    </Input>
  );
}
