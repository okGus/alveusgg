import React, { type SelectHTMLAttributes } from "react";
import { useField, type AriaFieldProps } from "react-aria";

type SelectBoxFieldProps = SelectHTMLAttributes<HTMLSelectElement> &
  AriaFieldProps & {
    label: string;
    className?: string;
  };

export function SelectBoxField(props: SelectBoxFieldProps) {
  const { labelProps, fieldProps } = useField(props);

  return (
    <div className={`flex-1 ${props.className || ""}`}>
      <label {...labelProps}>{props.label}</label>
      <br />
      <select
        className="w-full rounded-sm border border-gray-700 bg-white p-1"
        {...fieldProps}
      >
        {props.children}
      </select>
    </div>
  );
}
