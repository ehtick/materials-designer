import ResizableDrawer from "@exabyte-io/cove.js/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import React from "react";

import BaseJupyterLiteSessionComponent from "../include/jupyterlite/BaseJupyterLiteComponent";

class JupyterLiteSessionDrawer extends BaseJupyterLiteSessionComponent {
    render() {
        const { show, onHide, containerRef } = this.props;

        return (
            <div style={{ display: show ? "block" : "none" }}>
                <ResizableDrawer open={show} onClose={onHide} containerRef={containerRef}>
                    {this.renderJupyterLiteSession()}
                </ResizableDrawer>
            </div>
        );
    }
}

export default JupyterLiteSessionDrawer;
