/////////////////////////////////////////////////////////////////////
// Viewing.Extension.VisualReport
// by Philippe Leefsma, April 2016
//
/////////////////////////////////////////////////////////////////////
import MultiModelExtensionBase from 'Viewer.MultiModelExtensionBase'
import VisualReportPanel from './Viewing.Extension.VisualReport.Panel'
import ViewerToolkit from 'Viewer.Toolkit'

class VisualReportExtension extends MultiModelExtensionBase {

  /////////////////////////////////////////////////////////////////
  // Class constructor
  //
  /////////////////////////////////////////////////////////////////
  constructor(viewer, options) {

    super (viewer, options)
  }

  /////////////////////////////////////////////////////////////////
  // Extension Id
  //
  /////////////////////////////////////////////////////////////////
  static get ExtensionId() {

    return 'Viewing.Extension.VisualReport'
  }
  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  load() {

    console.log('Viewing.Extension.VisualReport loaded');

    return true;
  }

  /////////////////////////////////////////////////////////////////
  // Load callback
  //
  /////////////////////////////////////////////////////////////////
  async onModelCompletedLoad() {

    this.viewer.setQualityLevel(false, true)

    var componentIds = await ViewerToolkit.getLeafNodes(
      this.viewer.model);

    var fragIdToMaterial = {}

    componentIds.forEach(async(dbId) => {

      var fragIds = await ViewerToolkit.getFragIds(
        this.viewer.model, dbId)

      fragIds.forEach((fragId) => {

        let fragList = this.viewer.model.getFragmentList()

        let material = fragList.getMaterial(fragId)

        if(material) {

          fragIdToMaterial[fragId] = material
        }
      })
    })

    let properties = this.options.properties

    if (!properties) {

      properties = await ViewerToolkit.getPropertyList(
        this.viewer,
        componentIds)
    }

    this.control = ViewerToolkit.createButton(
      'toolbar-visual-report',
      'glyphicon glyphicon-tasks',
      'Visual Report', () => {

      this.panel.toggleVisibility()
    })

    this.parentControl = this.options.parentControl

    if (typeof this.parentControl === 'string') {

      var viewerToolbar = this.viewer.getToolbar(true)

      this.parentControl = viewerToolbar.getControl(
        this.parentControl)
    }

    this.parentControl.addControl(
      this.control)

    this.panel = new VisualReportPanel(
      this.viewer,
      properties,
      componentIds,
      this.control.container)

    this.panel.on('close', () => {

      for(let fragId in fragIdToMaterial) {

        let material = fragIdToMaterial[fragId]

        let fragList = this.viewer.model.getFragmentList()

        fragList.setMaterial(fragId, material)
      }

      ViewerToolkit.isolateFull(
        this.viewer)

      this.viewer.impl.invalidate(
        true, false, false)
    })
  }

  /////////////////////////////////////////////////////////////////
  // Unload callback
  //
  /////////////////////////////////////////////////////////////////
  unload() {

    console.log('Viewing.Extension.VisualReport unloaded')

    if (this.panel) {

      this.panel.setVisible(false)
    }

    if (this.control) {

      this.parentControl.removeControl(
        this.control)
    }

    return true
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension(
  VisualReportExtension.ExtensionId,
  VisualReportExtension);
