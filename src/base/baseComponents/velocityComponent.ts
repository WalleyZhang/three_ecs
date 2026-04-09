import { Component } from "../../core"

/** Velocity component: linear (x,y,z) and angular (rx,ry,rz) velocity */
export class VelocityComponent extends Component {
    public static CompName = "VelocityComponent";

    public x: number
    public y: number
    public z: number
    public rx: number
    public ry: number
    public rz: number
    public constructor(x: number = 0, y: number = 0, z: number = 0, rx: number = 0, ry: number = 0, rz: number = 0) {
        super()
        this.x = x
        this.y = y
        this.z = z
        this.rx = rx
        this.ry = ry
        this.rz = rz
    }
}