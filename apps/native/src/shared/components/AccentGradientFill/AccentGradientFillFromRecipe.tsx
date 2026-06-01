import type { AccentLinearRecipe, AccentRadialRecipe } from "@sd/design-tokens";
import { AccentGradientFill } from "./AccentGradientFill";

type AccentGradientFillFromRecipeProps = {
  borderRadius: number | string;
  recipe: { linear: AccentLinearRecipe; radial: AccentRadialRecipe };
};

export function AccentGradientFillFromRecipe({
  borderRadius,
  recipe,
}: AccentGradientFillFromRecipeProps) {
  return (
    <AccentGradientFill
      borderRadius={borderRadius}
      linearColors={recipe.linear.colors}
      linearStart={recipe.linear.start}
      linearEnd={recipe.linear.end}
      radialCenter={recipe.radial.center}
      radialRadius={recipe.radial.radius}
      radialCenterColor={recipe.radial.centerColor}
      radialEdgeColor={recipe.radial.edgeColor}
    />
  );
}
