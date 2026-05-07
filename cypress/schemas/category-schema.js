export const categorySchema = {
  type: 'object',
  required: ['id', 'name', 'slug', 'image'],
  properties: {
    id: {
      type: 'integer',
      minimum: 1,
      description: 'Unique identifier for the category'
    },
    name: {
      type: 'string',
      minLength: 1,
      description: 'Display name of the category'
    },
    slug: {
      type: 'string',
      minLength: 1,
      pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
      description: 'URL-friendly identifier'
    },
    image: {
      type: 'string',
      format: 'uri',
      description: 'URL to category image'
    }
  }
}

export const categoryArraySchema = {
  type: 'array',
  items: categorySchema,
  minItems: 1
}

export const productSchema = {
  type: 'object',
  required: ['id', 'title', 'slug', 'price', 'description', 'category', 'images'],
  properties: {
    id: {
      type: 'integer',
      minimum: 1
    },
    title: {
      type: 'string',
      minLength: 1
    },
    slug: {
      type: 'string',
      minLength: 1
    },
    price: {
      type: 'integer',
      minimum: 0
    },
    description: {
      type: 'string'
    },
    category: {
      type: 'object',
      required: ['id', 'name', 'slug', 'image'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string' },
        slug: { type: 'string' },
        image: { type: 'string' }
      }
    },
    images: {
      type: 'array',
      items: {
        type: 'string',
        format: 'uri'
      }
    }
  }
}

export const productArraySchema = {
  type: 'array',
  items: productSchema
}