import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { buttonClasses, type ButtonVariant } from "../utils/buttonStyles";

type ButtonOwnProps<T extends ElementType> = {
  as?: T;
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
};

type ButtonProps<T extends ElementType> = ButtonOwnProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof ButtonOwnProps<T>>;

export default function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  className = "",
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = as ?? "button";
  return (
    <Component className={buttonClasses(variant, className)} {...rest}>
      {children}
    </Component>
  );
}
