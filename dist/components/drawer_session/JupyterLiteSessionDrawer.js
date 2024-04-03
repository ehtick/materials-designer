import { jsx as _jsx } from "react/jsx-runtime";
import ResizableDrawer from "@exabyte-io/cove.js/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import BaseJupyterLiteSessionComponent from "../include/jupyterlite/BaseJupyterLiteComponent";
class JupyterLiteSessionDrawer extends BaseJupyterLiteSessionComponent {
    render() {
        const { show, onHide, containerRef } = this.props;
        return (_jsx("div", { style: { display: show ? "block" : "none" }, children: _jsx(ResizableDrawer, { open: show, onClose: onHide, containerRef: containerRef, children: super.render() }) }));
    }
}
export default JupyterLiteSessionDrawer;
