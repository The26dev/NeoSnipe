import { ShaderError } from './types';

export class ShaderCompiler {
    private gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    public compileShader(source: string, type: number): WebGLShader | null {
        const shader = this.gl.createShader(type);
        if (!shader) {
            throw new Error('Failed to create shader object');
        }

        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const error = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw this.parseShaderError(error || 'Unknown shader compilation error', source);
        }

        return shader;
    }

    public linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
        const program = this.gl.createProgram();
        if (!program) {
            throw new Error('Failed to create shader program');
        }

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const error = this.gl.getProgramInfoLog(program);
            this.gl.deleteProgram(program);
            throw new Error(error || 'Unknown program linking error');
        }

        return program;
    }

    private parseShaderError(error: string, source: string): ShaderError {
        const lines = source.split('\n');
        const errorRegex = /ERROR: \d+:(\d+): (.*)/;
        const match = error.match(errorRegex);

        if (match) {
            const [, lineNumber, message] = match;
            return {
                type: 'compile',
                message,
                source: lines[parseInt(lineNumber) - 1],
                lineNumber: parseInt(lineNumber)
            };
        }

        return {
            type: 'compile',
            message: error
        };
    }
}