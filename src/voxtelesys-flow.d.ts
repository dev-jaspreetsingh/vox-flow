declare module 'voxtelesys-flow' {
  export interface FlowBuilderStyling {
    primaryColor?: string
    leftSidebarWidth?: string
    rightSidebarWidth?: string
    defaultFontSize?: string
    fontFamily?: string
    [key: string]: string | undefined
  }

  export interface FlowBuilderOptions {
    apiKey: string
    flowGuid: string
    onBack?: () => void
    companyName?: string
    companyLogo?: string
    styling?: FlowBuilderStyling
  }

  export class FlowBuilder {
    static init(elementId: string, options: FlowBuilderOptions): Promise<void>
  }
}
