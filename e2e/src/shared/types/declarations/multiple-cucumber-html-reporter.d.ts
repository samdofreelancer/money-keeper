declare module "multiple-cucumber-html-reporter" {
  export interface Options {
    jsonDir: string;
    reportPath: string;
    metadata?: {
      browser?: {
        name: string;
        version: string;
      };
      device?: string;
      platform?: {
        name: string;
        version: string;
      };
    };
    customData?: {
      title: string;
      data: Array<{
        label: string;
        value: string;
      }>;
    };
    displayDuration?: boolean;
    durationInMS?: boolean;
    displayReportTime?: boolean;
    hideMetadata?: boolean;
    pageTitle?: string;
    reportName?: string;
    pageFooter?: string;
  }

  export function generate(options: Options): void;
}
