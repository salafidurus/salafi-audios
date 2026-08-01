package expo.modules.bottomaccessory

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.view.ViewTreeObserver
import com.google.android.material.navigation.NavigationBarView
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class ExpoBottomAccessoryView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  var offsetPaddingDp: Float = 0f
    set(value) {
      field = value
      updatePosition()
    }

  var animationEnabled: Boolean = true

  private var targetTabBar: View? = null
  private var trackedRootView: ViewGroup? = null

  private val onLayoutChangeListener = View.OnLayoutChangeListener { _, _, _, _, _, _, _, _, _ ->
    updatePosition()
  }

  private val globalLayoutListener = ViewTreeObserver.OnGlobalLayoutListener {
    if (targetTabBar == null) {
      findAndTrackTabBar()
    } else {
      updatePosition()
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    val root = rootView as? ViewGroup
    if (root != null) {
      trackedRootView = root
      root.viewTreeObserver?.addOnGlobalLayoutListener(globalLayoutListener)
    }
    findAndTrackTabBar()
  }

  override fun onDetachedFromWindow() {
    super.onDetachedFromWindow()
    stopGlobalTracking()
    targetTabBar?.removeOnLayoutChangeListener(onLayoutChangeListener)
    targetTabBar = null
    trackedRootView = null
  }

  private fun stopGlobalTracking() {
    trackedRootView?.viewTreeObserver?.removeOnGlobalLayoutListener(globalLayoutListener)
  }

  override fun onLayout(changed: Boolean, l: Int, t: Int, r: Int, b: Int) {
    super.onLayout(changed, l, t, r, b)
    if (targetTabBar == null) {
      findAndTrackTabBar()
    } else {
      updatePosition()
    }
  }

  private fun findAndTrackTabBar() {
    val root = (rootView as? ViewGroup) ?: trackedRootView ?: return
    val tabBar = findTabBarView(root)
    if (tabBar != null && tabBar != targetTabBar) {
      targetTabBar?.removeOnLayoutChangeListener(onLayoutChangeListener)

      targetTabBar = tabBar
      tabBar.addOnLayoutChangeListener(onLayoutChangeListener)
      stopGlobalTracking()
      updatePosition()
    }
  }

  private fun findTabBarView(group: ViewGroup): View? {
    for (i in 0 until group.childCount) {
      val child = group.getChildAt(i) ?: continue
      val className = child.javaClass.name
      val simpleName = child.javaClass.simpleName

      if (child is NavigationBarView ||
          simpleName.contains("BottomNavigation", ignoreCase = true) ||
          simpleName.contains("NavigationBar", ignoreCase = true) ||
          simpleName.contains("TabBar", ignoreCase = true) ||
          simpleName.contains("RNSTabsHost", ignoreCase = true) ||
          simpleName.contains("RNSTabs", ignoreCase = true) ||
          className.contains("bottomnavigation", ignoreCase = true)
      ) {
        return child
      }

      if (child is ViewGroup && child.childCount > 0) {
        val found = findTabBarView(child)
        if (found != null) return found
      }
    }
    return null
  }

  private fun updatePosition() {
    val tabBar = targetTabBar ?: run {
      findAndTrackTabBar()
      targetTabBar ?: return
    }

    val density = context.resources.displayMetrics.density
    val extraPaddingPx = offsetPaddingDp * density

    val tabBarHeight = tabBar.height.toFloat()
    if (tabBarHeight <= 0f) return

    val tabBarTranslationY = tabBar.translationY
    val targetTranslationY = -(tabBarHeight + extraPaddingPx - tabBarTranslationY)

    // Instant synchronous placement to eliminate response lag
    translationY = targetTranslationY
  }

  fun setAccessoryElevation(elevationDp: Float) {
    val density = context.resources.displayMetrics.density
    this.elevation = elevationDp * density
  }

  fun setAccessoryVisible(visible: Boolean) {
    this.visibility = if (visible) View.VISIBLE else View.GONE
  }
}
