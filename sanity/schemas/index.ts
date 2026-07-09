import { articleType } from "./article";
import { authorType } from "./author";
import { blockContentType } from "./block-content";
import { categoryType } from "./category";
import { pageType } from "./page";
import { pullQuoteType } from "./pull-quote";
import { scriptureType } from "./scripture";
import { siteSettingsType } from "./site-settings";

export const schemaTypes = [
  // Documents
  articleType,
  authorType,
  categoryType,
  pageType,
  siteSettingsType,
  // Objects
  blockContentType,
  scriptureType,
  pullQuoteType,
];
