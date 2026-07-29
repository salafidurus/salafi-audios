package expo.modules.bottomaccessory

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoBottomAccessoryModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoBottomAccessory")

    View(ExpoBottomAccessoryView::class) {
      Prop("offsetPadding") { view: ExpoBottomAccessoryView, padding: Float ->
        view.offsetPaddingDp = padding
      }
      Prop("animationEnabled") { view: ExpoBottomAccessoryView, enabled: Boolean ->
        view.animationEnabled = enabled
      }
      Prop("elevation") { view: ExpoBottomAccessoryView, elevation: Float ->
        view.setAccessoryElevation(elevation)
      }
      Prop("visible") { view: ExpoBottomAccessoryView, visible: Boolean ->
        view.setAccessoryVisible(visible)
      }
    }
  }
}
