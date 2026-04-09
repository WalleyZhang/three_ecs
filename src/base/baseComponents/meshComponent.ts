import { Component } from "../../core";
import { Mesh } from "three";

export class MeshComponent extends Component {
    public static CompName = "MeshComponent";
    public mesh: Mesh;

    public constructor(mesh: Mesh | null = null) {
        super();
        this.mesh = mesh || new Mesh();
    }

    /** Dispose geometry + materials and detach from parent. Shared resources will also be affected. */
    public destroy(): void {
        this.mesh.parent?.remove(this.mesh);
        this.mesh.geometry.dispose();
        const mat = this.mesh.material;
        if (mat) {
            (Array.isArray(mat) ? mat : [mat]).forEach(m => m.dispose());
        }
    }
}
