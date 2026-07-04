import axios from 'axios';
import * as cheerio from 'cheerio';

import { detectFileTypeFromBuffer } from './fileType';

type PageIcon = {
  data: Buffer;
  ext: string;
  size: number;
};

type PageIconOptions = {
  ext?: string;
};

function getDomainUrl(pageUrl: string): string {
  const parsedUrl = new URL(pageUrl);
  return parsedUrl.origin;
}

function hrefLooksLikeIcon(href: string): boolean {
  return /((icon.*\.(png|jpe?g))|(\w+\.ico))/i.test(href);
}

function getLinkTagLinks($: cheerio.CheerioAPI): string[] {
  const links: string[] = [];
  $('link').each((index, element) => {
    const href = $(element).attr('href');
    if (!href) {
      return;
    }

    const rel = $(element).attr('rel');
    if (rel?.toLowerCase().includes('icon') || hrefLooksLikeIcon(href)) {
      links.push(href);
    }
  });
  return links;
}

function getMetaTagLinks($: cheerio.CheerioAPI): string[] {
  const links: string[] = [];
  $('meta').each((index, element) => {
    const property = $(element).attr('property') ?? $(element).attr('name');
    if (property !== 'og:image' && property !== 'twitter:image') {
      return;
    }

    const graphImageUrl = $(element).attr('content');
    if (graphImageUrl) {
      links.push(graphImageUrl);
    }
  });
  return links;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function resolveIconLinks(rootUrl: string, dom: string): string[] {
  const $ = cheerio.load(dom);
  const domainUrl = getDomainUrl(rootUrl);
  const pageLinks = [...getLinkTagLinks($), ...getMetaTagLinks($)];
  const fallbackLinks = ['/apple-touch-icon.png', '/favicon.ico'];

  return unique([
    ...pageLinks.map((iconLink) => new URL(iconLink, rootUrl).href),
    ...fallbackLinks.map((iconLink) => new URL(iconLink, domainUrl).href),
  ]);
}

async function getPage(pageUrl: string): Promise<string> {
  const response = await axios.get<string>(pageUrl, { responseType: 'text' });
  return response.data;
}

async function downloadIcon(iconUrl: string): Promise<PageIcon | undefined> {
  let response;
  try {
    response = await axios.get<Buffer>(iconUrl, {
      responseType: 'arraybuffer',
    });
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return undefined;
    }
    throw error;
  }

  if (!response.data) {
    return undefined;
  }

  const data = Buffer.from(response.data);
  const fileDetails = await detectFileTypeFromBuffer(data);
  if (!fileDetails || !fileDetails.mime.startsWith('image/')) {
    return undefined;
  }

  return {
    data,
    ext: `.${fileDetails.ext}`,
    size: data.length,
  };
}

function findBestIcon(icons: PageIcon[], preferredExt?: string): PageIcon {
  const sorted = icons.sort((a, b) => b.size - a.size);
  const preferred = sorted.find((icon) => icon.ext === preferredExt);
  return preferred ?? sorted[0];
}

async function inferIconFromUrl(
  pageUrl: string,
  options: PageIconOptions,
): Promise<PageIcon | undefined> {
  const dom = await getPage(pageUrl);
  const iconUrls = resolveIconLinks(pageUrl, dom);
  const downloadedIcons = await Promise.all(iconUrls.map(downloadIcon));
  const icons = downloadedIcons.filter((icon): icon is PageIcon => !!icon);

  if (icons.length === 0) {
    return undefined;
  }

  return findBestIcon(icons, options.ext);
}

function isHttps(pageUrl: string): boolean {
  return new URL(pageUrl).protocol === 'https:';
}

function makeHttps(pageUrl: string): string {
  const parsedUrl = new URL(pageUrl);
  parsedUrl.protocol = 'https:';
  return parsedUrl.href;
}

export async function pageIcon(
  pageUrl: string,
  options: PageIconOptions = {},
): Promise<PageIcon | undefined> {
  const result = await inferIconFromUrl(pageUrl, options);
  if (result || isHttps(pageUrl)) {
    return result;
  }

  return inferIconFromUrl(makeHttps(pageUrl), options);
}
