import { CST } from './cst'
import {
  AST,
  Alias,
  Collection,
  Merge,
  Node,
  Pair,
  Scalar,
  Schema,
  YAMLMap,
  YAMLSeq
} from './types'
import { Type, YAMLError, YAMLWarning } from './util'

export { AST, CST }

export function parseCST(str: string): ParsedCST

export interface ParsedCST extends Array<CST.Document> {
  setOrigRanges(): boolean
}

/**
 * Apply a visitor to an AST node or document.
 *
 * Walks through the tree (depth-first) starting from `node`, calling a
 * `visitor` function with three arguments:
 *   - `key`: For sequence values and map `Pair`, the node's index in the
 *     collection. Within a `Pair`, `'key'` or `'value'`, correspondingly.
 *     `null` for the root node.
 *   - `node`: The current node.
 *   - `path`: The ancestry of the current node.
 *
 * The return value of the visitor may be used to control the traversal:
 *   - `undefined` (default): Do nothing and continue
 *   - `visit.SKIP`: Do not visit the children of this node, continue with next
 *     sibling
 *   - `visit.BREAK`: Terminate traversal completely
 *   - `visit.REMOVE`: Remove the current node, then continue with the next one
 *   - `Node`: Replace the current node, then continue by visiting it
 *   - `number`: While iterating the items of a sequence or map, set the index
 *     of the next step. This is useful especially if the index of the current
 *     node has changed.
 *
 * If `visitor` is a single function, it will be called with all values
 * encountered in the tree, including e.g. `null` values. Alternatively,
 * separate visitor functions may be defined for each `Map`, `Pair`, `Seq`,
 * `Alias` and `Scalar` node.
 */
export declare const visit: visit

export type visitor<T> = (
  key: number | 'key' | 'value' | null,
  node: T,
  path: Node[]
) => void | symbol | number | Node

export interface visit {
  (
    node: Node | Document,
    visitor:
      | visitor<any>
      | {
          Alias?: visitor<Alias>
          Map?: visitor<YAMLMap>
          Pair?: visitor<Pair>
          Scalar?: visitor<Scalar>
          Seq?: visitor<YAMLSeq>
        }
  ): void

  /** Terminate visit traversal completely */
  BREAK: symbol

  /** Remove the current node */
  REMOVE: symbol

  /** Do not visit the children of the current node */
  SKIP: symbol
}

/**
 * `yaml` defines document-specific options in three places: as an argument of
 * parse, create and stringify calls, in the values of `YAML.defaultOptions`,
 * and in the version-dependent `YAML.Document.defaults` object. Values set in
 * `YAML.defaultOptions` override version-dependent defaults, and argument
 * options override both.
 */
export const defaultOptions: Options

type Replacer = any[] | ((key: any, value: any) => boolean)
type Reviver = (key: any, value: any) => any

export interface Options extends Schema.Options {
  /**
   * Default prefix for anchors.
   *
   * Default: `'a'`, resulting in anchors `a1`, `a2`, etc.
   */
  anchorPrefix?: string
  /**
   * The number of spaces to use when indenting code.
   *
   * Default: `2`
   */
  indent?: number
  /**
   * Whether block sequences should be indented.
   *
   * Default: `true`
   */
  indentSeq?: boolean
  /**
   * Include references in the AST to each node's corresponding CST node.
   *
   * Default: `false`
   */
  keepCstNodes?: boolean
  /**
   * Set original ranges (support \r\n line endings) for included cstNodes
   * Only has an effect if `keepCstNodes` is enabled
   *
   * Default: `false`
   */
  setOrigRanges?: boolean
  /**
   * Store the original node type when parsing documents.
   *
   * Default: `true`
   */
  keepNodeTypes?: boolean
  /**
   * Keep `undefined` object values when creating mappings and return a Scalar
   * node when calling `YAML.stringify(undefined)`, rather than `undefined`.
   *
   * Default: `false`
   */
  keepUndefined?: boolean
  /**
   * When outputting JS, use Map rather than Object to represent mappings.
   *
   * Default: `false`
   */
  mapAsMap?: boolean
  /**
   * Prevent exponential entity expansion attacks by limiting data aliasing count;
   * set to `-1` to disable checks; `0` disallows all alias nodes.
   *
   * Default: `100`
   */
  maxAliasCount?: number
  /**
   * Include line position & node type directly in errors; drop their verbose source and context.
   *
   * Default: `true`
   */
  prettyErrors?: boolean
  /**
   * When stringifying, require keys to be scalars and to use implicit rather than explicit notation.
   *
   * Default: `false`
   */
  simpleKeys?: boolean
  /**
   * The YAML version used by documents without a `%YAML` directive.
   *
   * Default: `"1.2"`
   */
  version?: '1.0' | '1.1' | '1.2'
}

/**
 * Some customization options are availabe to control the parsing and
 * stringification of scalars. Note that these values are used by all documents.
 */
export const scalarOptions: {
  binary: scalarOptions.Binary
  bool: scalarOptions.Bool
  int: scalarOptions.Int
  null: scalarOptions.Null
  str: scalarOptions.Str
}
export namespace scalarOptions {
  interface Binary {
    /**
     * The type of string literal used to stringify `!!binary` values.
     *
     * Default: `'BLOCK_LITERAL'`
     */
    defaultType: Scalar.Type
    /**
     * Maximum line width for `!!binary`.
     *
     * Default: `76`
     */
    lineWidth: number
  }

  interface Bool {
    /**
     * String representation for `true`. With the core schema, use `'true' | 'True' | 'TRUE'`.
     *
     * Default: `'true'`
     */
    trueStr: string
    /**
     * String representation for `false`. With the core schema, use `'false' | 'False' | 'FALSE'`.
     *
     * Default: `'false'`
     */
    falseStr: string
  }

  interface Int {
    /**
     * Whether integers should be parsed into BigInt values.
     *
     * Default: `false`
     */
    asBigInt: boolean
  }

  interface Null {
    /**
     * String representation for `null`. With the core schema, use `'null' | 'Null' | 'NULL' | '~' | ''`.
     *
     * Default: `'null'`
     */
    nullStr: string
  }

  interface Str {
    /**
     * The default type of string literal used to stringify values in general
     *
     * Default: `'PLAIN'`
     */
    defaultType: Scalar.Type
    /**
     * The default type of string literal used to stringify implicit key values
     *
     * Default: `'PLAIN'`
     */
    defaultKeyType: Scalar.Type
    /**
     * Use 'single quote' rather than "double quote" by default
     *
     * Default: `false`
     */
    defaultQuoteSingle: boolean
    doubleQuoted: {
      /**
       * Whether to restrict double-quoted strings to use JSON-compatible syntax.
       *
       * Default: `false`
       */
      jsonEncoding: boolean
      /**
       * Minimum length to use multiple lines to represent the value.
       *
       * Default: `40`
       */
      minMultiLineLength: number
    }
    fold: {
      /**
       * Maximum line width (set to `0` to disable folding).
       *
       * Default: `80`
       */
      lineWidth: number
      /**
       * Minimum width for highly-indented content.
       *
       * Default: `20`
       */
      minContentWidth: number
    }
  }
}

export interface CreateNodeOptions {
  /**
   * Filter or modify values while creating a node.
   *
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter
   */
  replacer?: Replacer
  /**
   * Specify the collection type, e.g. `"!!omap"`. Note that this requires the
   * corresponding tag to be available in this document's schema.
   */
  tag?: string
  /**
   * Wrap plain values in `Scalar` objects.
   *
   * Default: `true`
   */
  wrapScalars?: boolean
}

export class Document extends Collection {
  cstNode?: CST.Document
  /**
   * @param value - The initial value for the document, which will be wrapped
   *   in a Node container.
   */
  constructor(value?: any, options?: Options)
  constructor(value: any, replacer: null | Replacer, options?: Options)
  tag: never
  directivesEndMarker?: boolean
  type: Type.DOCUMENT
  /**
   * Anchors associated with the document's nodes;
   * also provides alias & merge node creators.
   */
  anchors: Document.Anchors
  /** The document contents. */
  contents: any
  /** Errors encountered during parsing. */
  errors: YAMLError[]
  /**
   * The schema used with the document. Use `setSchema()` to change or
   * initialise.
   */
  schema?: Schema
  /**
   * Array of prefixes; each will have a string `handle` that
   * starts and ends with `!` and a string `prefix` that the handle will be replaced by.
   */
  tagPrefixes: Document.TagPrefix[]
  /**
   * The parsed version of the source document;
   * if true-ish, stringified output will include a `%YAML` directive.
   */
  version?: string
  /** Warnings encountered during parsing. */
  warnings: YAMLWarning[]

  /**
   * Convert any value into a `Node` using the current schema, recursively
   * turning objects into collections.
   */
  createNode(
    value: any,
    { replacer, tag, wrapScalars }?: CreateNodeOptions
  ): Node
  /**
   * Convert a key and a value into a `Pair` using the current schema,
   * recursively wrapping all values as `Scalar` or `Collection` nodes.
   *
   * @param options If `wrapScalars` is not `false`, wraps plain values in
   *   `Scalar` objects.
   */
  createPair(key: any, value: any, options?: { wrapScalars?: boolean }): Pair
  /**
   * List the tags used in the document that are not in the default
   * `tag:yaml.org,2002:` namespace.
   */
  listNonDefaultTags(): string[]
  /** Parse a CST into this document */
  parse(cst: CST.Document): this
  /**
   * When a document is created with `new YAML.Document()`, the schema object is
   * not set as it may be influenced by parsed directives; call this with no
   * arguments to set it manually, or with arguments to change the schema used
   * by the document.
   */
  setSchema(
    id?: Options['version'] | Schema.Name,
    customTags?: (Schema.TagId | Schema.Tag)[]
  ): void
  /** Set `handle` as a shorthand string for the `prefix` tag namespace. */
  setTagPrefix(handle: string, prefix: string): void
  /**
   * A plain JavaScript representation of the document `contents`.
   *
   * @param mapAsMap - Use Map rather than Object to represent mappings.
   *   Overrides values set in Document or global options.
   * @param onAnchor - If defined, called with the resolved `value` and
   *   reference `count` for each anchor in the document.
   * @param reviver - A function that may filter or modify the output JS value
   */
  toJS(opt?: {
    mapAsMap?: boolean
    onAnchor?: (value: any, count: number) => void
    reviver?: Reviver
  }): any
  /**
   * A JSON representation of the document `contents`.
   *
   * @param arg Used by `JSON.stringify` to indicate the array index or property
   *   name.
   */
  toJSON(arg?: string): any
  /** A YAML representation of the document. */
  toString(): string
}

export namespace Document {
  interface Parsed extends Document {
    contents: Scalar | YAMLMap | YAMLSeq | null
    /** The schema used with the document. */
    schema: Schema
  }

  interface Anchors {
    /**
     * Create a new `Alias` node, adding the required anchor for `node`.
     * If `name` is empty, a new anchor name will be generated.
     */
    createAlias(node: Node, name?: string): Alias
    /**
     * Create a new `Merge` node with the given source nodes.
     * Non-`Alias` sources will be automatically wrapped.
     */
    createMergePair(...nodes: Node[]): Merge
    /** The anchor name associated with `node`, if set. */
    getName(node: Node): undefined | string
    /** List of all defined anchor names. */
    getNames(): string[]
    /** The node associated with the anchor `name`, if set. */
    getNode(name: string): undefined | Node
    /**
     * Find an available anchor name with the given `prefix` and a
     * numerical suffix.
     */
    newName(prefix: string): string
    /**
     * Associate an anchor with `node`. If `name` is empty, a new name will be generated.
     * To remove an anchor, use `setAnchor(null, name)`.
     */
    setAnchor(node: Node | null, name?: string): void | string
  }

  interface TagPrefix {
    handle: string
    prefix: string
  }
}

/**
 * Recursively turns objects into collections. Generic objects as well as `Map`
 * and its descendants become mappings, while arrays and other iterable objects
 * result in sequences.
 *
 * The primary purpose of this function is to enable attaching comments or other
 * metadata to a value, or to otherwise exert more fine-grained control over the
 * stringified output. To that end, you'll need to assign its return value to
 * the `contents` of a Document (or somewhere within said contents), as the
 * document's schema is required for YAML string output.
 *
 * @param wrapScalars If undefined or `true`, also wraps plain values in
 *   `Scalar` objects; if `false` and `value` is not an object, it will be
 *   returned directly.
 * @param tag Use to specify the collection type, e.g. `"!!omap"`. Note that
 *   this requires the corresponding tag to be available based on the default
 *   options. To use a specific document's schema, use `doc.schema.createNode`.
 */
export function createNode(
  value: any,
  wrapScalars?: true,
  tag?: string
): YAMLMap | YAMLSeq | Scalar

/**
 * YAML.createNode recursively turns objects into Map and arrays to Seq collections.
 * Its primary use is to enable attaching comments or other metadata to a value,
 * or to otherwise exert more fine-grained control over the stringified output.
 *
 * Doesn't wrap plain values in Scalar objects.
 */
export function createNode(
  value: any,
  wrapScalars: false,
  tag?: string
): YAMLMap | YAMLSeq | string | number | boolean | null

/**
 * Parse an input string into a single YAML.Document.
 */
export function parseDocument(str: string, options?: Options): Document.Parsed

/**
 * Parse the input as a stream of YAML documents.
 *
 * Documents should be separated from each other by `...` or `---` marker lines.
 */
export function parseAllDocuments(
  str: string,
  options?: Options
): Document.Parsed[]

/**
 * Parse an input string into JavaScript.
 *
 * Only supports input consisting of a single YAML document; for multi-document
 * support you should use `YAML.parseAllDocuments`. May throw on error, and may
 * log warnings using `console.warn`.
 *
 * @param str - A string with YAML formatting.
 * @param reviver - A reviver function, as in `JSON.parse()`
 * @returns The value will match the type of the root value of the parsed YAML
 *   document, so Maps become objects, Sequences arrays, and scalars result in
 *   nulls, booleans, numbers and strings.
 */
export function parse(str: string, options?: Options): any
export function parse(
  str: string,
  reviver: null | Reviver,
  options?: Options
): any

/**
 * Stringify a value as a YAML document.
 *
 * @param replacer - A replacer array or function, as in `JSON.stringify()`
 * @returns Will always include `\n` as the last character, as is expected of YAML documents.
 */
export function stringify(value: any, options?: Options): string
export function stringify(
  value: any,
  replacer: null | Replacer,
  options?: number | string | Options
): string
