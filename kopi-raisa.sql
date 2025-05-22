--
-- PostgreSQL database dump
--

-- Dumped from database version 14.8
-- Dumped by pg_dump version 15.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: OrderStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."OrderStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELED'
);


ALTER TYPE public."OrderStatus" OWNER TO postgres;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'QRIS',
    'CREDIT_CARD',
    'BANK_TRANSFER'
);


ALTER TYPE public."PaymentMethod" OWNER TO postgres;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'SUCCESS',
    'FAILED',
    'CANCEL',
    'DENY',
    'EXPIRE',
    'REFUND'
);


ALTER TYPE public."PaymentStatus" OWNER TO postgres;

--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'FAILED',
    'REJECTED',
    'EXPIRED',
    'CANCELED',
    'AUTHORIZED',
    'REFUNDED',
    'PENDING',
    'COMPLETED',
    'SUBMITTED'
);


ALTER TYPE public."TransactionStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Cart; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Cart" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Cart" OWNER TO postgres;

--
-- Name: CartItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."CartItem" (
    id integer NOT NULL,
    cart_id integer NOT NULL,
    products_id integer NOT NULL,
    quantity integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CartItem" OWNER TO postgres;

--
-- Name: CartItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."CartItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CartItem_id_seq" OWNER TO postgres;

--
-- Name: CartItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."CartItem_id_seq" OWNED BY public."CartItem".id;


--
-- Name: Cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Cart_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Cart_id_seq" OWNER TO postgres;

--
-- Name: Cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Cart_id_seq" OWNED BY public."Cart".id;


--
-- Name: FacebookAccount; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FacebookAccount" (
    id text NOT NULL,
    facebook_id text NOT NULL,
    access_token text NOT NULL,
    token_expires timestamp(3) without time zone NOT NULL,
    page_id text NOT NULL,
    page_name text NOT NULL,
    name text NOT NULL,
    image text,
    email text NOT NULL,
    "userId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    page_access_token text,
    ig_user_id text,
    "instagramAccount_id" text,
    instagram_username text
);


ALTER TABLE public."FacebookAccount" OWNER TO postgres;

--
-- Name: FormEntry; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormEntry" (
    id integer NOT NULL,
    form_template_id integer NOT NULL,
    user_id integer NOT NULL,
    submitted_at timestamp(3) without time zone
);


ALTER TABLE public."FormEntry" OWNER TO postgres;

--
-- Name: FormEntry_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."FormEntry_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FormEntry_id_seq" OWNER TO postgres;

--
-- Name: FormEntry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."FormEntry_id_seq" OWNED BY public."FormEntry".id;


--
-- Name: FormField; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormField" (
    id integer NOT NULL,
    form_template_id integer NOT NULL,
    field_name text NOT NULL,
    field_type text NOT NULL
);


ALTER TABLE public."FormField" OWNER TO postgres;

--
-- Name: FormField_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."FormField_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FormField_id_seq" OWNER TO postgres;

--
-- Name: FormField_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."FormField_id_seq" OWNED BY public."FormField".id;


--
-- Name: FormTemplate; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."FormTemplate" (
    id integer NOT NULL,
    title text NOT NULL,
    google_form_link text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."FormTemplate" OWNER TO postgres;

--
-- Name: FormTemplate_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."FormTemplate_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."FormTemplate_id_seq" OWNER TO postgres;

--
-- Name: FormTemplate_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."FormTemplate_id_seq" OWNED BY public."FormTemplate".id;


--
-- Name: Inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Inventory" (
    id integer NOT NULL,
    products_id integer NOT NULL,
    stock integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Inventory" OWNER TO postgres;

--
-- Name: Inventory_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Inventory_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Inventory_id_seq" OWNER TO postgres;

--
-- Name: Inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Inventory_id_seq" OWNED BY public."Inventory".id;


--
-- Name: News; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."News" (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."News" OWNER TO postgres;

--
-- Name: NewsMedia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NewsMedia" (
    id integer NOT NULL,
    news_id integer NOT NULL,
    media_url text NOT NULL,
    media_type text NOT NULL,
    "isThumbnail" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."NewsMedia" OWNER TO postgres;

--
-- Name: NewsMedia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."NewsMedia_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."NewsMedia_id_seq" OWNER TO postgres;

--
-- Name: NewsMedia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."NewsMedia_id_seq" OWNED BY public."NewsMedia".id;


--
-- Name: News_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."News_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."News_id_seq" OWNER TO postgres;

--
-- Name: News_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."News_id_seq" OWNED BY public."News".id;


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Notification" (
    id integer NOT NULL,
    name text NOT NULL,
    viewed boolean DEFAULT false NOT NULL,
    description text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Notification" OWNER TO postgres;

--
-- Name: Notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Notification_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Notification_id_seq" OWNER TO postgres;

--
-- Name: Notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Notification_id_seq" OWNED BY public."Notification".id;


--
-- Name: Order; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Order" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status public."OrderStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Order" OWNER TO postgres;

--
-- Name: OrderCancellation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderCancellation" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    user_id integer NOT NULL,
    reason text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."OrderCancellation" OWNER TO postgres;

--
-- Name: OrderCancellation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderCancellation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OrderCancellation_id_seq" OWNER TO postgres;

--
-- Name: OrderCancellation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderCancellation_id_seq" OWNED BY public."OrderCancellation".id;


--
-- Name: OrderItem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OrderItem" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    products_id integer NOT NULL,
    quantity integer NOT NULL,
    price integer NOT NULL,
    custom_note text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    partner_id integer,
    notified_to_partner_at timestamp(3) without time zone
);


ALTER TABLE public."OrderItem" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OrderItem_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."OrderItem_id_seq" OWNER TO postgres;

--
-- Name: OrderItem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OrderItem_id_seq" OWNED BY public."OrderItem".id;


--
-- Name: Order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Order_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Order_id_seq" OWNER TO postgres;

--
-- Name: Order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Order_id_seq" OWNED BY public."Order".id;


--
-- Name: Partner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Partner" (
    id integer NOT NULL,
    name text NOT NULL,
    owner_name text NOT NULL,
    phone_number text NOT NULL,
    address text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Partner" OWNER TO postgres;

--
-- Name: Partner_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Partner_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Partner_id_seq" OWNER TO postgres;

--
-- Name: Partner_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Partner_id_seq" OWNED BY public."Partner".id;


--
-- Name: Payment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Payment" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    amount integer NOT NULL,
    status public."PaymentStatus" NOT NULL,
    method public."PaymentMethod",
    snap_token text,
    snap_redirect_url text,
    payment_info text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Payment" OWNER TO postgres;

--
-- Name: Payment_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Payment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Payment_id_seq" OWNER TO postgres;

--
-- Name: Payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Payment_id_seq" OWNED BY public."Payment".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    name text NOT NULL,
    price integer NOT NULL,
    description text,
    image text,
    partner_id integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Product" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Product_id_seq" OWNER TO postgres;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Review" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    order_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Review" OWNER TO postgres;

--
-- Name: Review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Review_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Review_id_seq" OWNER TO postgres;

--
-- Name: Review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Review_id_seq" OWNED BY public."Review".id;


--
-- Name: ShippingAddress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."ShippingAddress" (
    id integer NOT NULL,
    order_id integer NOT NULL,
    address text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ShippingAddress" OWNER TO postgres;

--
-- Name: ShippingAddress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."ShippingAddress_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."ShippingAddress_id_seq" OWNER TO postgres;

--
-- Name: ShippingAddress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."ShippingAddress_id_seq" OWNED BY public."ShippingAddress".id;


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Transaction" (
    id integer NOT NULL,
    user_id integer NOT NULL,
    status public."TransactionStatus" NOT NULL,
    total_amount integer NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO postgres;

--
-- Name: Transaction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Transaction_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Transaction_id_seq" OWNER TO postgres;

--
-- Name: Transaction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Transaction_id_seq" OWNED BY public."Transaction".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id integer NOT NULL,
    name text NOT NULL,
    image text,
    email text NOT NULL,
    password text,
    phone_number text,
    admin boolean DEFAULT false NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    google_id text
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Cart id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart" ALTER COLUMN id SET DEFAULT nextval('public."Cart_id_seq"'::regclass);


--
-- Name: CartItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem" ALTER COLUMN id SET DEFAULT nextval('public."CartItem_id_seq"'::regclass);


--
-- Name: FormEntry id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormEntry" ALTER COLUMN id SET DEFAULT nextval('public."FormEntry_id_seq"'::regclass);


--
-- Name: FormField id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormField" ALTER COLUMN id SET DEFAULT nextval('public."FormField_id_seq"'::regclass);


--
-- Name: FormTemplate id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormTemplate" ALTER COLUMN id SET DEFAULT nextval('public."FormTemplate_id_seq"'::regclass);


--
-- Name: Inventory id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory" ALTER COLUMN id SET DEFAULT nextval('public."Inventory_id_seq"'::regclass);


--
-- Name: News id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."News" ALTER COLUMN id SET DEFAULT nextval('public."News_id_seq"'::regclass);


--
-- Name: NewsMedia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NewsMedia" ALTER COLUMN id SET DEFAULT nextval('public."NewsMedia_id_seq"'::regclass);


--
-- Name: Notification id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification" ALTER COLUMN id SET DEFAULT nextval('public."Notification_id_seq"'::regclass);


--
-- Name: Order id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order" ALTER COLUMN id SET DEFAULT nextval('public."Order_id_seq"'::regclass);


--
-- Name: OrderCancellation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderCancellation" ALTER COLUMN id SET DEFAULT nextval('public."OrderCancellation_id_seq"'::regclass);


--
-- Name: OrderItem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem" ALTER COLUMN id SET DEFAULT nextval('public."OrderItem_id_seq"'::regclass);


--
-- Name: Partner id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Partner" ALTER COLUMN id SET DEFAULT nextval('public."Partner_id_seq"'::regclass);


--
-- Name: Payment id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment" ALTER COLUMN id SET DEFAULT nextval('public."Payment_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: Review id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review" ALTER COLUMN id SET DEFAULT nextval('public."Review_id_seq"'::regclass);


--
-- Name: ShippingAddress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShippingAddress" ALTER COLUMN id SET DEFAULT nextval('public."ShippingAddress_id_seq"'::regclass);


--
-- Name: Transaction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction" ALTER COLUMN id SET DEFAULT nextval('public."Transaction_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: Cart; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Cart" (id, user_id, created_at, updated_at) FROM stdin;
1	2	2025-05-08 10:42:42.749	2025-05-08 10:42:42.749
\.


--
-- Data for Name: CartItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CartItem" (id, cart_id, products_id, quantity, created_at, updated_at) FROM stdin;
3	1	2	2	2025-05-08 13:59:36.271	2025-05-10 15:16:19.328
\.


--
-- Data for Name: FacebookAccount; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FacebookAccount" (id, facebook_id, access_token, token_expires, page_id, page_name, name, image, email, "userId", "createdAt", "updatedAt", page_access_token, ig_user_id, "instagramAccount_id", instagram_username) FROM stdin;
6e3209fc-82db-4673-97f8-9398b99c0dbb	544830562056657	EAAJwZAmnHzwkBO790dtZCcqeywafwYu5hpsE2q5yEjIOZBOrFZBu6LPtOP1v5EAzxKyVDQv6fjAZAfQkZBAGOIA303Wjxg9vXj7ykocpUPZBMpYrCnlABlZB04sZAlUOWskTX2ihRIPHlqrSdlVt38oJFiygOyMFyAZB06JxW7yZAD9dcu3DkMWY40AuZCczYZB3BZCZCZAtAL6TLPQAW6605BsthnRslYPPFBQGsJDO	2025-04-12 20:48:48.584	544830562056657	Testing kopi raisa	Luis Axifer	https://platform-lookaside.fbsbx.com/platform/profilepic/?asid=1055094243336501&height=50&width=50&ext=1747079327&hash=AbaQhookp8Q_GOtmvk8wwTkz	1055094243336501@facebook.com	7	2025-04-12 19:24:41.293	2025-04-12 19:48:48.588	\N	\N	\N	\N
\.


--
-- Data for Name: FormEntry; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormEntry" (id, form_template_id, user_id, submitted_at) FROM stdin;
\.


--
-- Data for Name: FormField; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormField" (id, form_template_id, field_name, field_type) FROM stdin;
\.


--
-- Data for Name: FormTemplate; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."FormTemplate" (id, title, google_form_link, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Inventory; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Inventory" (id, products_id, stock, created_at, updated_at) FROM stdin;
2	3	10	2025-04-27 23:43:37.299	2025-04-27 23:43:37.299
1	2	50	2025-04-27 23:42:20.212	2025-05-13 10:23:13.09
\.


--
-- Data for Name: News; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."News" (id, title, content, user_id, created_at, updated_at) FROM stdin;
2	berita kedua	ini berita yang dibuat untuk ujicoba 2	2	2025-03-26 08:29:42.035	2025-03-26 08:31:00.596
1	berita pertama	ini berita yang dibuat untuk ujicoba 1, telah diupdate image dan publishnya	2	2025-03-26 08:27:35.337	2025-03-26 09:00:01.406
\.


--
-- Data for Name: NewsMedia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NewsMedia" (id, news_id, media_url, media_type, "isThumbnail") FROM stdin;
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Notification" (id, name, viewed, description, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: Order; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Order" (id, user_id, status, created_at, updated_at) FROM stdin;
1	1	PENDING	2025-05-20 00:48:30.314	2025-05-20 00:48:30.314
2	1	PENDING	2025-05-20 00:48:30.37	2025-05-20 00:48:30.37
3	1	PENDING	2025-05-20 00:57:16.503	2025-05-20 00:57:16.503
4	1	PENDING	2025-05-20 00:57:16.521	2025-05-20 00:57:16.521
5	1	PENDING	2025-05-20 01:47:31.456	2025-05-20 01:47:31.456
6	2	PENDING	2025-05-20 07:42:20.179	2025-05-20 07:42:20.179
7	2	PENDING	2025-05-20 07:45:22.882	2025-05-20 07:45:22.882
8	2	PENDING	2025-05-20 07:51:57.716	2025-05-20 07:51:57.716
9	2	PENDING	2025-05-20 07:59:27.026	2025-05-20 07:59:27.026
10	2	PENDING	2025-05-20 19:24:12.022	2025-05-20 19:24:12.022
11	2	PENDING	2025-05-20 19:26:43.934	2025-05-20 19:26:43.934
12	2	PENDING	2025-05-20 19:29:47.018	2025-05-20 19:29:47.018
13	2	PENDING	2025-05-20 19:30:09.574	2025-05-20 19:30:09.574
14	2	PENDING	2025-05-20 20:18:58.963	2025-05-20 20:18:58.963
15	2	PENDING	2025-05-20 20:24:37.652	2025-05-20 20:24:37.652
16	2	PENDING	2025-05-20 21:18:23.111	2025-05-20 21:18:23.111
17	2	PENDING	2025-05-21 00:44:24.085	2025-05-21 00:44:24.085
18	2	PENDING	2025-05-21 01:13:33.86	2025-05-21 01:13:33.86
19	2	PENDING	2025-05-21 01:15:51.72	2025-05-21 01:15:51.72
20	2	PENDING	2025-05-21 01:19:20.763	2025-05-21 01:19:20.763
21	2	PENDING	2025-05-21 01:20:09.538	2025-05-21 01:20:09.538
22	2	PENDING	2025-05-21 01:21:34.972	2025-05-21 01:21:34.972
23	2	PENDING	2025-05-21 01:24:03.357	2025-05-21 01:24:03.357
24	2	PENDING	2025-05-21 01:35:28.67	2025-05-21 01:35:28.67
25	2	PENDING	2025-05-21 02:26:54.26	2025-05-21 02:26:54.26
26	2	PENDING	2025-05-21 02:27:35.171	2025-05-21 02:27:35.171
27	2	PENDING	2025-05-21 04:58:23.542	2025-05-21 04:58:23.542
28	2	PENDING	2025-05-21 05:01:32.642	2025-05-21 05:01:32.642
29	2	PENDING	2025-05-21 05:08:20.451	2025-05-21 05:08:20.451
30	2	PENDING	2025-05-21 05:13:31.107	2025-05-21 05:13:31.107
31	2	PENDING	2025-05-21 05:22:11.437	2025-05-21 05:22:11.437
32	2	PENDING	2025-05-21 05:45:41.804	2025-05-21 05:45:41.804
33	2	PENDING	2025-05-21 05:46:34.665	2025-05-21 05:46:34.665
34	2	PENDING	2025-05-21 05:48:49.078	2025-05-21 05:48:49.078
35	2	PENDING	2025-05-21 06:28:35.904	2025-05-21 06:28:35.904
36	2	PENDING	2025-05-21 06:29:30.171	2025-05-21 06:29:30.171
37	2	PENDING	2025-05-21 06:34:34.168	2025-05-21 06:34:34.168
38	2	PENDING	2025-05-21 07:37:00.118	2025-05-21 07:37:00.118
39	2	PENDING	2025-05-21 07:37:47.9	2025-05-21 07:37:47.9
\.


--
-- Data for Name: OrderCancellation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderCancellation" (id, order_id, user_id, reason, created_at) FROM stdin;
\.


--
-- Data for Name: OrderItem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OrderItem" (id, order_id, products_id, quantity, price, custom_note, created_at, updated_at, partner_id, notified_to_partner_at) FROM stdin;
2	2	2	2	40000	Tolong bungkus terpisah	2025-05-20 00:48:30.37	2025-05-20 07:00:32.528	2	\N
4	4	2	2	40000	Tolong bungkus terpisah	2025-05-20 00:57:16.521	2025-05-20 07:00:32.528	2	\N
5	5	2	3	60000	Tolong bungkus terpisah	2025-05-20 01:47:31.456	2025-05-20 07:00:32.528	2	\N
7	6	2	2	40000	Tanpa gula	2025-05-20 07:42:20.179	2025-05-20 07:42:20.179	2	\N
8	7	2	10	200000	\N	2025-05-20 07:45:22.882	2025-05-20 07:45:22.882	2	\N
10	8	2	20	400000	Tanpa gula	2025-05-20 07:51:57.716	2025-05-20 07:51:57.716	2	\N
12	9	2	10	20000	Tanpa gula	2025-05-20 07:59:27.026	2025-05-20 07:59:27.026	2	\N
14	10	2	10	20000	Tanpa gula	2025-05-20 19:24:12.022	2025-05-20 19:24:12.022	2	\N
16	11	2	10	20000	kemasan hitam	2025-05-20 19:26:43.934	2025-05-20 19:26:43.934	2	\N
18	12	2	10	20000	kemasan hitam	2025-05-20 19:29:47.018	2025-05-20 19:29:47.018	2	\N
20	13	2	10	20000	kemasan hitam	2025-05-20 19:30:09.574	2025-05-20 19:30:09.574	2	\N
22	14	2	20	20000	kemasan hitam	2025-05-20 20:18:58.963	2025-05-20 20:18:58.963	2	\N
24	15	2	30	20000	kemasan hitam	2025-05-20 20:24:37.652	2025-05-20 20:24:37.652	2	\N
26	16	2	40	20000	kemasan hitam	2025-05-20 21:18:23.111	2025-05-20 21:18:23.111	2	\N
28	17	2	50	20000	kemasan hitam	2025-05-21 00:44:24.085	2025-05-21 00:44:24.085	2	\N
30	18	2	60	20000	kemasan hitam	2025-05-21 01:13:33.86	2025-05-21 01:13:33.86	2	\N
32	19	2	60	20000	kemasan hitam	2025-05-21 01:15:51.72	2025-05-21 01:15:51.72	2	\N
34	20	2	6	20000	kemasan hitam	2025-05-21 01:19:20.763	2025-05-21 01:19:20.763	2	\N
36	21	2	6	20000	kemasan hitam	2025-05-21 01:20:09.538	2025-05-21 01:20:09.538	2	\N
38	22	2	6	20000	kemasan hitam	2025-05-21 01:21:34.972	2025-05-21 01:21:34.972	2	\N
40	23	2	6	20000	kemasan hitam	2025-05-21 01:24:03.357	2025-05-21 01:24:03.357	2	\N
42	24	2	6	20000	kemasan hitam	2025-05-21 01:35:28.67	2025-05-21 01:35:28.67	2	\N
44	25	2	7	20000	kemasan merah	2025-05-21 02:26:54.26	2025-05-21 02:26:54.26	2	\N
46	26	2	7	20000	kemasan merah	2025-05-21 02:27:35.171	2025-05-21 02:27:35.171	2	\N
48	27	2	8	20000	kemasan biru	2025-05-21 04:58:23.542	2025-05-21 04:58:23.542	2	\N
50	28	2	8	20000	kemasan biru	2025-05-21 05:01:32.642	2025-05-21 05:01:32.642	2	\N
27	17	3	50	100	\N	2025-05-21 00:44:24.085	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
52	29	2	9	20000	kemasan biru	2025-05-21 05:08:20.451	2025-05-21 05:08:20.451	2	\N
25	16	3	40	100	\N	2025-05-20 21:18:23.111	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
54	30	2	10	20000	kemasan biru	2025-05-21 05:13:31.107	2025-05-21 05:13:31.107	2	\N
23	15	3	30	100	\N	2025-05-20 20:24:37.652	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
56	31	2	10	20000	kemasan biru	2025-05-21 05:22:11.437	2025-05-21 05:22:11.437	2	\N
21	14	3	20	100	\N	2025-05-20 20:18:58.963	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
58	32	2	11	20000	kemasan biru	2025-05-21 05:45:41.804	2025-05-21 05:45:41.804	2	\N
19	13	3	10	100	\N	2025-05-20 19:30:09.574	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
60	33	2	12	20000	kemasan biru	2025-05-21 05:46:34.665	2025-05-21 05:46:34.665	2	\N
17	12	3	10	100	\N	2025-05-20 19:29:47.018	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
62	34	2	13	20000	kemasan biru	2025-05-21 05:48:49.078	2025-05-21 05:48:49.078	2	\N
15	11	3	10	100	\N	2025-05-20 19:26:43.934	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
64	35	2	14	20000	kemasan biru	2025-05-21 06:28:35.904	2025-05-21 06:28:35.904	2	\N
13	10	3	5	100	\N	2025-05-20 19:24:12.022	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
66	36	2	15	20000	kemasan biru	2025-05-21 06:29:30.171	2025-05-21 06:29:30.171	2	\N
11	9	3	5	100	\N	2025-05-20 07:59:27.026	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
68	37	2	16	20000	kemasan biru	2025-05-21 06:34:34.168	2025-05-21 06:34:34.168	2	\N
9	8	3	10	1000	\N	2025-05-20 07:51:57.716	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
70	38	2	17	20000	kemasan biru	2025-05-21 07:37:00.118	2025-05-21 07:37:00.118	2	\N
6	6	3	1	100	\N	2025-05-20 07:42:20.179	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
72	39	2	18	20000	kemasan biru	2025-05-21 07:37:47.9	2025-05-21 07:37:47.9	2	\N
3	3	3	2	200	bungkus biasa saja	2025-05-20 00:57:16.503	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
1	1	3	1	100	\N	2025-05-20 00:48:30.314	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
53	30	3	10	100	kemasan putih	2025-05-21 05:13:31.107	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
55	31	3	10	100	kemasan putih	2025-05-21 05:22:11.437	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
57	32	3	11	100	kemasan putih	2025-05-21 05:45:41.804	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
59	33	3	12	100	kemasan putih	2025-05-21 05:46:34.665	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
61	34	3	13	100	kemasan putih	2025-05-21 05:48:49.078	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
63	35	3	14	100	kemasan putih	2025-05-21 06:28:35.904	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
65	36	3	15	100	kemasan putih	2025-05-21 06:29:30.171	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
67	37	3	16	100	kemasan putih	2025-05-21 06:34:34.168	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
69	38	3	17	100	kemasan putih	2025-05-21 07:37:00.118	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
71	39	3	18	100	kemasan putih	2025-05-21 07:37:47.9	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
51	29	3	9	100	kemasan putih	2025-05-21 05:08:20.451	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
49	28	3	8	100	kemasan putih	2025-05-21 05:01:32.642	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
47	27	3	8	100	kemasan putih	2025-05-21 04:58:23.542	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
45	26	3	7	100	kemasan putih	2025-05-21 02:27:35.171	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
43	25	3	7	100	kemasan putih	2025-05-21 02:26:54.26	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
41	24	3	6	100	kemasan pink	2025-05-21 01:35:28.67	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
39	23	3	6	100	kemasan pink	2025-05-21 01:24:03.357	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
37	22	3	6	100	kemasan pink	2025-05-21 01:21:34.972	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
35	21	3	6	100	kemasan pink	2025-05-21 01:20:09.538	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
33	20	3	6	100	kemasan pink	2025-05-21 01:19:20.763	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
31	19	3	60	100	\N	2025-05-21 01:15:51.72	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
29	18	3	60	100	\N	2025-05-21 01:13:33.86	2025-05-21 20:23:57.949	1	2025-05-21 20:23:57.947
\.


--
-- Data for Name: Partner; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Partner" (id, name, owner_name, phone_number, address, created_at, updated_at) FROM stdin;
1	komunitas arabika	Baskara durga	081234567890896	Jl. Mangga No. 10, Surabaya	2025-04-27 23:41:37.175	2025-04-27 23:41:37.175
2	komunitas Argopura	Baskara durga	081234567890896	Jl. Mangga No. 10, Surabaya	2025-05-13 10:19:52.96	2025-05-13 10:19:52.96
3	komunitas Kopi Sri Rejeki	Akbar Ramadhan	085231356796	Jl. Jawa No.8A	2025-05-21 19:04:39.23	2025-05-21 19:04:39.23
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Payment" (id, order_id, amount, status, method, snap_token, snap_redirect_url, payment_info, created_at, updated_at) FROM stdin;
1	1	100	PENDING	QRIS	\N	\N	\N	2025-05-20 00:48:30.314	2025-05-20 00:48:30.314
2	2	40000	PENDING	QRIS	\N	\N	\N	2025-05-20 00:48:30.37	2025-05-20 00:48:30.37
3	3	200	PENDING	QRIS	\N	\N	\N	2025-05-20 00:57:16.503	2025-05-20 00:57:16.503
4	4	40000	PENDING	QRIS	\N	\N	\N	2025-05-20 00:57:16.521	2025-05-20 00:57:16.521
5	5	60000	PENDING	QRIS	\N	\N	\N	2025-05-20 01:47:31.456	2025-05-20 01:47:31.456
6	6	40100	PENDING	QRIS	\N	\N	\N	2025-05-20 07:42:20.179	2025-05-20 07:42:20.179
7	7	200000	PENDING	QRIS	\N	\N	\N	2025-05-20 07:45:22.882	2025-05-20 07:45:22.882
8	8	401000	PENDING	QRIS	\N	\N	\N	2025-05-20 07:51:57.716	2025-05-20 07:51:57.716
9	9	200500	PENDING	QRIS	\N	\N	\N	2025-05-20 07:59:27.026	2025-05-20 07:59:27.026
10	10	200500	PENDING	QRIS	\N	\N	\N	2025-05-20 19:24:12.022	2025-05-20 19:24:12.022
11	11	201000	PENDING	QRIS	\N	\N	\N	2025-05-20 19:26:43.934	2025-05-20 19:26:43.934
12	12	201000	PENDING	QRIS	\N	\N	\N	2025-05-20 19:29:47.018	2025-05-20 19:29:47.018
13	13	201000	PENDING	QRIS	\N	\N	\N	2025-05-20 19:30:09.574	2025-05-20 19:30:09.574
14	14	402000	PENDING	BANK_TRANSFER	\N	\N	\N	2025-05-20 20:18:58.963	2025-05-20 20:18:58.963
15	15	603000	PENDING	CREDIT_CARD	\N	\N	\N	2025-05-20 20:24:37.652	2025-05-20 20:24:37.652
16	16	804000	PENDING	BANK_TRANSFER	\N	\N	\N	2025-05-20 21:18:23.111	2025-05-20 21:18:23.111
17	17	1005000	PENDING	BANK_TRANSFER	\N	\N	\N	2025-05-21 00:44:24.085	2025-05-21 00:44:24.085
18	18	1206000	PENDING	BANK_TRANSFER	\N	\N	\N	2025-05-21 01:13:33.86	2025-05-21 01:13:33.86
19	19	1206000	PENDING	BANK_TRANSFER	bdd261d9-c58e-46ae-ae0d-0066c9e1e2ae	\N	\N	2025-05-21 01:15:51.72	2025-05-21 01:15:52.049
20	20	120600	PENDING	BANK_TRANSFER	5f8eb6f5-520d-4acb-9af7-cc783ec56b78	\N	\N	2025-05-21 01:19:20.763	2025-05-21 01:19:21.093
21	21	120600	PENDING	BANK_TRANSFER	e2583b01-0c99-478e-9338-bdb7f66ee2b3	\N	\N	2025-05-21 01:20:09.538	2025-05-21 01:20:09.812
22	22	120600	PENDING	BANK_TRANSFER	\N	\N	\N	2025-05-21 01:21:34.972	2025-05-21 01:21:34.972
23	23	120600	PENDING	BANK_TRANSFER	aad6cfca-a39d-4841-a608-56839d6551f3	\N	\N	2025-05-21 01:24:03.357	2025-05-21 01:24:03.631
24	24	120600	PENDING	BANK_TRANSFER	f471b033-cf30-4ba0-bae5-139dbafc4674	\N	\N	2025-05-21 01:35:28.67	2025-05-21 01:35:29.255
25	25	140700	PENDING	BANK_TRANSFER	1382f03f-13b9-4a49-8be8-dc495085d0f9	https://app.sandbox.midtrans.com/snap/v2/vtweb/1382f03f-13b9-4a49-8be8-dc495085d0f9	\N	2025-05-21 02:26:54.26	2025-05-21 02:26:54.647
26	26	140700	PENDING	BANK_TRANSFER	e66d2427-fac5-43cc-9674-2adf9dc356e4	https://app.sandbox.midtrans.com/snap/v2/vtweb/e66d2427-fac5-43cc-9674-2adf9dc356e4	\N	2025-05-21 02:27:35.171	2025-05-21 02:27:35.459
27	27	160800	PENDING	BANK_TRANSFER	9f6bacd4-b17c-4658-b7ef-b17fcec0d55f	https://app.sandbox.midtrans.com/snap/v2/vtweb/9f6bacd4-b17c-4658-b7ef-b17fcec0d55f	\N	2025-05-21 04:58:23.542	2025-05-21 04:58:23.935
28	28	160800	PENDING	BANK_TRANSFER	c7117de5-a6b0-42d8-b6fc-ce13c14d8847	https://app.sandbox.midtrans.com/snap/v2/vtweb/c7117de5-a6b0-42d8-b6fc-ce13c14d8847	\N	2025-05-21 05:01:32.642	2025-05-21 05:01:32.925
29	29	180900	PENDING	BANK_TRANSFER	ea4a870c-075d-48fb-a359-38e10a70bf6e	https://app.sandbox.midtrans.com/snap/v2/vtweb/ea4a870c-075d-48fb-a359-38e10a70bf6e	\N	2025-05-21 05:08:20.451	2025-05-21 05:08:20.795
30	30	201000	PENDING	QRIS	c39ecf5a-2b2a-49fb-a6b2-f11df4de52c4	https://app.sandbox.midtrans.com/snap/v2/vtweb/c39ecf5a-2b2a-49fb-a6b2-f11df4de52c4	\N	2025-05-21 05:13:31.107	2025-05-21 05:13:31.428
31	31	201000	PENDING	QRIS	d21ace21-66e3-4d07-808e-0f5f62b0c041	https://app.sandbox.midtrans.com/snap/v2/vtweb/d21ace21-66e3-4d07-808e-0f5f62b0c041	\N	2025-05-21 05:22:11.437	2025-05-21 05:22:11.74
32	32	221100	PENDING	QRIS	53eb04fb-e604-4e5b-bf27-9f9d233e8c0a	https://app.sandbox.midtrans.com/snap/v2/vtweb/53eb04fb-e604-4e5b-bf27-9f9d233e8c0a	\N	2025-05-21 05:45:41.804	2025-05-21 05:45:42.345
33	33	241200	PENDING	QRIS	1d69dfec-46dc-4732-b3e1-53a5a133911c	https://app.sandbox.midtrans.com/snap/v2/vtweb/1d69dfec-46dc-4732-b3e1-53a5a133911c	\N	2025-05-21 05:46:34.665	2025-05-21 05:46:34.979
34	34	261300	PENDING	BANK_TRANSFER	c2884255-db50-4d86-88cf-99f103ec9442	https://app.sandbox.midtrans.com/snap/v2/vtweb/c2884255-db50-4d86-88cf-99f103ec9442	\N	2025-05-21 05:48:49.078	2025-05-21 05:48:49.289
35	35	281400	PENDING	BANK_TRANSFER	3a228e39-2dd0-42fd-9f6b-cbab7a53664e	https://app.sandbox.midtrans.com/snap/v2/vtweb/3a228e39-2dd0-42fd-9f6b-cbab7a53664e	\N	2025-05-21 06:28:35.904	2025-05-21 06:28:36.252
36	36	301500	PENDING	QRIS	https://api.sandbox.midtrans.com/v2/qris/0107eafb-8ca6-4f82-94e5-9d046495e993/qr-code	https://app.sandbox.midtrans.com/snap/v2/vtweb/https://api.sandbox.midtrans.com/v2/qris/0107eafb-8ca6-4f82-94e5-9d046495e993/qr-code	\N	2025-05-21 06:29:30.171	2025-05-21 06:29:30.624
37	37	321600	PENDING	QRIS	https://api.sandbox.midtrans.com/v2/qris/650081d7-c512-49c8-b78d-d43b8afbd9e5/qr-code	https://api.sandbox.midtrans.com/v2/qris/650081d7-c512-49c8-b78d-d43b8afbd9e5/qr-code	\N	2025-05-21 06:34:34.168	2025-05-21 06:34:34.612
38	38	341700	PENDING	QRIS	https://api.sandbox.midtrans.com/v2/qris/cb4e8c5c-4e3e-48bf-9052-728ef3d8f13a/qr-code	https://api.sandbox.midtrans.com/v2/qris/cb4e8c5c-4e3e-48bf-9052-728ef3d8f13a/qr-code	\N	2025-05-21 07:37:00.118	2025-05-21 07:37:00.66
39	39	361800	PENDING	BANK_TRANSFER	1ba8f8e2-78b5-48d8-bcb1-53b088f06a11	https://app.sandbox.midtrans.com/snap/v2/vtweb/1ba8f8e2-78b5-48d8-bcb1-53b088f06a11	\N	2025-05-21 07:37:47.9	2025-05-21 07:37:48.222
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Product" (id, name, price, description, image, partner_id, created_at, updated_at) FROM stdin;
3	Produk B	100	Deskripsi produk A	\N	1	2025-04-27 23:43:37.296	2025-04-27 23:43:37.296
2	kopi Argopura blend	20000	ini kopi Argopura	https://res.cloudinary.com/darsrhtsb/image/upload/v1747131722/konten-kopiraisa/1747131685467_ChatGPT%20Image%20May%202%2C%202025%2C%2006_09_09%20PM.png.png	2	2025-04-27 23:42:20.203	2025-05-13 10:23:13.085
\.


--
-- Data for Name: Review; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Review" (id, user_id, product_id, order_id, rating, comment, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: ShippingAddress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."ShippingAddress" (id, order_id, address, created_at, updated_at) FROM stdin;
1	1	Jl. Bunga No. 10, Jakarta	2025-05-20 00:48:30.314	2025-05-20 00:48:30.314
2	2	Jl. Bunga No. 10, Jakarta	2025-05-20 00:48:30.37	2025-05-20 00:48:30.37
3	3	Jl. Bunga No. 10, Jakarta	2025-05-20 00:57:16.503	2025-05-20 00:57:16.503
4	4	Jl. Bunga No. 10, Jakarta	2025-05-20 00:57:16.521	2025-05-20 00:57:16.521
5	5	Jl. Bunga No. 1, Jakarta	2025-05-20 01:47:31.456	2025-05-20 01:47:31.456
6	6	Jl. Kopi Raisa No. 7	2025-05-20 07:42:20.179	2025-05-20 07:42:20.179
7	7	Jl. Kopi Raisa No. 7	2025-05-20 07:45:22.882	2025-05-20 07:45:22.882
8	8	Jl. Kopi Raisa No. 7	2025-05-20 07:51:57.716	2025-05-20 07:51:57.716
9	9	Jl. Kopi Raisa No. 7	2025-05-20 07:59:27.026	2025-05-20 07:59:27.026
10	10	Jl. Kopi Raisa No. 7	2025-05-20 19:24:12.022	2025-05-20 19:24:12.022
11	11	Jl. JAWA No. 8A	2025-05-20 19:26:43.934	2025-05-20 19:26:43.934
12	12	Jl. JAWA No. 8A	2025-05-20 19:29:47.018	2025-05-20 19:29:47.018
13	13	Jl. JAWA No. 8A	2025-05-20 19:30:09.574	2025-05-20 19:30:09.574
14	14	Jl. JAWA No. 8A	2025-05-20 20:18:58.963	2025-05-20 20:18:58.963
15	15	Jl. JAWA No. 8A	2025-05-20 20:24:37.652	2025-05-20 20:24:37.652
16	16	Jl. JAWA No. 8A	2025-05-20 21:18:23.111	2025-05-20 21:18:23.111
17	17	Jl. JAWA No. 8A	2025-05-21 00:44:24.085	2025-05-21 00:44:24.085
18	18	Jl. JAWA No. 8A	2025-05-21 01:13:33.86	2025-05-21 01:13:33.86
19	19	Jl. JAWA No. 8A	2025-05-21 01:15:51.72	2025-05-21 01:15:51.72
20	20	Jl. JAWA No. 8A	2025-05-21 01:19:20.763	2025-05-21 01:19:20.763
21	21	Jl. JAWA No. 8A	2025-05-21 01:20:09.538	2025-05-21 01:20:09.538
22	22	Jl. JAWA No. 8A	2025-05-21 01:21:34.972	2025-05-21 01:21:34.972
23	23	Jl. JAWA No. 8A	2025-05-21 01:24:03.357	2025-05-21 01:24:03.357
24	24	Jl. JAWA No. 8A	2025-05-21 01:35:28.67	2025-05-21 01:35:28.67
25	25	Jl. JAWA No. 8A	2025-05-21 02:26:54.26	2025-05-21 02:26:54.26
26	26	Jl. JAWA No. 8A	2025-05-21 02:27:35.171	2025-05-21 02:27:35.171
27	27	Jl. JAWA No. 8A	2025-05-21 04:58:23.542	2025-05-21 04:58:23.542
28	28	Jl. JAWA No. 8A	2025-05-21 05:01:32.642	2025-05-21 05:01:32.642
29	29	Jl. JAWA No. 8A	2025-05-21 05:08:20.451	2025-05-21 05:08:20.451
30	30	Jl. JAWA No. 8A	2025-05-21 05:13:31.107	2025-05-21 05:13:31.107
31	31	Jl. JAWA No. 8A	2025-05-21 05:22:11.437	2025-05-21 05:22:11.437
32	32	Jl. JAWA No. 8A	2025-05-21 05:45:41.804	2025-05-21 05:45:41.804
33	33	Jl. JAWA No. 8A	2025-05-21 05:46:34.665	2025-05-21 05:46:34.665
34	34	Jl. JAWA No. 8A	2025-05-21 05:48:49.078	2025-05-21 05:48:49.078
35	35	Jl. JAWA No. 8A	2025-05-21 06:28:35.904	2025-05-21 06:28:35.904
36	36	Jl. JAWA No. 8A	2025-05-21 06:29:30.171	2025-05-21 06:29:30.171
37	37	Jl. JAWA No. 8A	2025-05-21 06:34:34.168	2025-05-21 06:34:34.168
38	38	Jl. JAWA No. 8A	2025-05-21 07:37:00.118	2025-05-21 07:37:00.118
39	39	Jl. JAWA No. 8A	2025-05-21 07:37:47.9	2025-05-21 07:37:47.9
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Transaction" (id, user_id, status, total_amount, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, image, email, password, phone_number, admin, verified, "createdAt", updated_at, google_id) FROM stdin;
2	adrian1	\N	adrian1@gmail.com	$2b$10$7huprsG8WfUj2.TNWgXMC.TYrQYjNtIb417GEHIn3w25/qjaPuYjW	111111	t	f	2025-03-25 15:15:43.525	2025-03-25 15:16:06.529	\N
3	Akbar Rmdhan	https://lh3.googleusercontent.com/a/ACg8ocL8N4WRJl0h7kpHx86wttqVnAOFxHYTw0rvh7dPo4H5laLHZOw=s96-c	akbarrmdhan@mail.com	\N	\N	f	t	2025-03-28 21:14:22.119	2025-03-28 22:27:27.593	\N
7	akbar	https://www.google.com/imgres?q=gambar%20user&imgurl=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F1%2F12%2FUser_icon_2.svg%2F2048px-User_icon_2.svg.png&imgrefurl=https%3A%2F%2Fid.m.wikipedia.org%2Fwiki%2FBerkas%3AUser_icon_2.svg&docid=scVsZV5jbUDvgM&tbnid=HEI2WJ7F-gtP1M&vet=12ahUKEwicju245sGMAxXZR2wGHQ_4JHoQM3oECGMQAA..i&w=2048&h=2048&hcb=2&ved=2ahUKEwicju245sGMAxXZR2wGHQ_4JHoQM3oECGMQAA	akbarrmdhan175@gmail.com	$2b$10$5JbWrDiVgZ0rtZqBDkpdg.uj6Ok1o.L3qrOGXIQ3gt8Apke1lmhAi	0000000	f	f	2025-03-28 22:28:58.082	2025-04-05 21:21:41.121	\N
1	adrian	\N	adrian@gmail.com	$2b$10$/QDhBUzGTDRkAEIubgr2buzxHHmrSLJwFUTx04IP0NsK5n9nbY0Ce	000000	f	f	2025-03-25 00:57:50.831	2025-04-06 19:16:30.987	\N
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
fd52ba3e-ab7a-4347-93f3-0649b3737834	fbca2426c42f9fdff10ebea89801ba9e8a8ad4bbbdf63f54ef97c4a20ccf33ff	2025-03-25 06:02:02.767726+07	20250324230202_add_user_table	\N	\N	2025-03-25 06:02:02.753927+07	1
a519d38b-7d36-4f07-be8b-38d7b5452fde	9a67d088360246e5cf5f04ee78a027a8d977b639c32f07ea9a6db959e0a1a7da	2025-05-08 17:36:26.798681+07	20250508103626_make_user_id_unique_in_cart	\N	\N	2025-05-08 17:36:26.787268+07	1
04af99e9-2e1d-4743-b910-d67e6b68c508	58cb378ad8cb66ada0e580d71be7985a625965f676f3da2ba2434277496d8000	2025-03-25 06:05:17.550679+07	20250324230517_remove_token_column	\N	\N	2025-03-25 06:05:17.544087+07	1
0c65243f-98db-4da2-851d-22cd400ac9e9	b0b38ad08ba29ec47d4cc232a7948bc585c1acf7a71c3104ef023b98e9124510	2025-04-22 20:25:00.869442+07	20250422132500_add_is_thumbnail_and_rename_image_url_to_thumnail_url_in_news	\N	\N	2025-04-22 20:25:00.859072+07	1
9264bce9-1c57-46e5-a8f8-e303ce48e353	f1035b667819668695ed8d840a590756d9a17a02f2c66e5bdbb740b4118fb64d	2025-03-26 00:07:11.562879+07	20250325170711_update_fil_all_tables_fix	\N	\N	2025-03-26 00:07:11.435357+07	1
dae6a0ff-5589-49e0-9f04-54ab4362e5d0	521bc5e179905d1a5e604004cf10e0f55cb17a95a52f65b87fdeb2a4073f8536	2025-03-29 01:59:07.171896+07	20250328185907_add_google_oauth	\N	\N	2025-03-29 01:59:07.155053+07	1
d46d1ffe-730e-458e-bb2c-ade68cea3f70	dcee3d78d8f8c6c31b154b6aeb13707dc3fda6345e0d99897ec5ad4d53154469	2025-03-29 04:13:48.310842+07	20250328211348_phone_number_null	\N	\N	2025-03-29 04:13:48.306953+07	1
0ea2df9e-0548-4218-9500-5aa81bbc1341	96b1ff418185256616eb89e637e9daed136632d4c0dd413a3f5f12d336d7e218	2025-04-26 04:34:32.866745+07	20250425213432_remove_thumbnail_url_in_tabel_news	\N	\N	2025-04-26 04:34:32.856568+07	1
9742d558-3b19-4dff-9600-9dc92506c650	7f10f94869cfce8b883766e4e13ae845f1f772b5fcada093d63e1f6649716998	2025-04-12 16:26:41.568511+07	20250412092641_add_fb_coloumn	\N	\N	2025-04-12 16:26:41.558944+07	1
ea1e265f-6bce-4799-97dd-b35c93064611	f8f0a3bfa12baf363eaa07ca2ae0137cf1bad14ae1fddfcc8268cf2af6ed7d4f	2025-04-12 18:45:46.105698+07	20250412114546_add_facebook_account	\N	\N	2025-04-12 18:45:46.06567+07	1
929d5f48-78be-41d3-beb0-ee21cd283711	db3ea91e0b600169c2bbcef9d014b140757d50ac99e8c5bbab4bddcd3e0a0256	2025-05-21 20:20:40.344239+07	20250521132040_add_order_cancellation_table_again	\N	\N	2025-05-21 20:20:40.321782+07	1
f54cac4f-09a4-487c-bf2e-e552f57e56b2	2fc6b30b1017cd0719c5eaca8961d33a7f29e66d03703d76b563a57a37c0d469	2025-04-13 01:29:11.675571+07	20250412182911_remove_unique_user_id_in_model_facebook_account_real	\N	\N	2025-04-13 01:29:11.667353+07	1
53d2891d-9d4e-4abc-a91b-4d827c36274b	ebd5ee7cba2b444bd47105327f408ebc1e6c64b556e67233e2df723295566e69	2025-04-26 04:36:43.603631+07	20250425213643_add_thumbnail_url_in_tabel_news	\N	\N	2025-04-26 04:36:43.599305+07	1
1f933f71-01e7-4d5e-8c8c-ed925b70953c	855d5eff482b0709a5a13222466ccfea0b7ee3e2e072373d878fa6b253d21c1f	2025-04-13 02:22:18.22915+07	20250412192218_add_unique_user_id_in_model_facebook_accoun	\N	\N	2025-04-13 02:22:18.218677+07	1
c959f29c-0cb7-4a77-9b6f-dac8c96822e7	82efa7ff613c50ae1bfc12df4047e3ab32962aad3fbaede9233327f2e2cff797	2025-04-16 17:59:48.650242+07	20250413132315_edit	\N	\N	2025-04-16 17:59:48.637834+07	1
f830ee62-b5a7-496e-b361-87408307c683	e9dcb7ae965e23ccfc6adac2275ba89e736d6aa72ff5234391ccd294ea55ae63	2025-05-20 13:57:27.562766+07	20250520065727_move_partner_relation_from_order_to_order_item	\N	\N	2025-05-20 13:57:27.54056+07	1
66f26c2b-ef90-402a-afce-f1247aa04111	8c9b9824fb93f13e09fba6fe3a3028009c4f25111ff0527bbefdd5c6e111b7c6	2025-04-16 17:59:51.432731+07	20250416105951_add_coloumn_pages_access_token	\N	\N	2025-04-16 17:59:51.430228+07	1
baa0dee0-7b01-41f5-8d9e-2d151b5325eb	c2076c64f6a7f9d5eaa3e3bb61e532146dc318f179ad3569ee8eaa3f6d49d26d	2025-04-28 12:39:16.898917+07	20250428053916_remove_thumbnail_url_in_model_news	\N	\N	2025-04-28 12:39:16.889089+07	1
e42c9795-e6cc-4474-b521-f3ef3922c6dd	e32329d8cfda1b23aa9be3aa6aab7373e30a557775b950306da51c7c8bd94f1d	2025-04-18 23:42:32.903995+07	20250418164232_add_instagram_oauth_coloumn	\N	\N	2025-04-18 23:42:32.892444+07	1
51678da2-55d4-4532-8b79-2fb158520c07	2f16504c8fa37a9f91df242bba71b7f8ada2a93691139804a0adb8953dd86bbf	2025-04-19 20:12:37.013569+07	20250419131236_remove_published	\N	\N	2025-04-19 20:12:36.998919+07	1
89230566-b438-4f00-afe4-4f9c52607dc1	a083e8accb0b71c4025ce1b99c3f09ad28a8a6bb49bc50d12c9ef5cc28455666	2025-04-30 13:24:33.404614+07	20250430062433_add_on_delete_cascade_in_model_inventory	\N	\N	2025-04-30 13:24:33.376163+07	1
bd1fd73e-4387-44a2-88e8-5982e511c8db	c7205be946497acffede981e0a5f968f41e4a607bc63c37f3220f090c661295a	2025-04-30 13:38:54.932513+07	20250430063854_remove_on_delete_cascade_in_model_inventory	\N	\N	2025-04-30 13:38:54.920993+07	1
6e402385-6109-409d-91a8-476be07419ea	2c954ad1c127f61ca58d58d750e0be432a8963af10fffa589cc53fac9d37783f	2025-05-21 11:22:16.172767+07	20250521042216_add_proprty_enum_payment_status	\N	\N	2025-05-21 11:22:16.167482+07	1
580b70a1-3908-4527-8797-90697c2eab7f	a083e8accb0b71c4025ce1b99c3f09ad28a8a6bb49bc50d12c9ef5cc28455666	2025-04-30 13:49:47.434705+07	20250430064947_add_on_delete_cascade_in_model_inventory	\N	\N	2025-04-30 13:49:47.419512+07	1
4dc6988c-ead2-437e-9170-8dbfe57e3127	8f0ddf2652d1b323afc6eb74acc9b928fb4f1921a34ed65ad63f0e6ebd5c9e34	2025-05-22 01:51:31.104518+07	20250521185131_add_orderitem_notified	\N	\N	2025-05-22 01:51:31.095667+07	1
d77e1c92-7eaa-4a33-a4a3-c8e00643ec44	db3ea91e0b600169c2bbcef9d014b140757d50ac99e8c5bbab4bddcd3e0a0256	2025-05-21 19:57:41.251062+07	20250521125741_add_order_cancellation_table	\N	\N	2025-05-21 19:57:41.206331+07	1
c073a008-86c3-4721-8477-02fe8553f273	9a351aed93ceb776eb52e68600ff0ff70c281fd09af5c239565f7ab4f31b7531	2025-05-21 20:10:50.810116+07	20250521131050_remove_order_cancellation_table	\N	\N	2025-05-21 20:10:50.797417+07	1
\.


--
-- Name: CartItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."CartItem_id_seq"', 3, true);


--
-- Name: Cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Cart_id_seq"', 1, true);


--
-- Name: FormEntry_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FormEntry_id_seq"', 1, false);


--
-- Name: FormField_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FormField_id_seq"', 1, false);


--
-- Name: FormTemplate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."FormTemplate_id_seq"', 1, false);


--
-- Name: Inventory_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Inventory_id_seq"', 2, true);


--
-- Name: NewsMedia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."NewsMedia_id_seq"', 1, false);


--
-- Name: News_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."News_id_seq"', 3, true);


--
-- Name: Notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Notification_id_seq"', 1, false);


--
-- Name: OrderCancellation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderCancellation_id_seq"', 1, false);


--
-- Name: OrderItem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OrderItem_id_seq"', 72, true);


--
-- Name: Order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Order_id_seq"', 39, true);


--
-- Name: Partner_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Partner_id_seq"', 3, true);


--
-- Name: Payment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Payment_id_seq"', 39, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Product_id_seq"', 3, true);


--
-- Name: Review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Review_id_seq"', 1, false);


--
-- Name: ShippingAddress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."ShippingAddress_id_seq"', 39, true);


--
-- Name: Transaction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Transaction_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."User_id_seq"', 7, true);


--
-- Name: CartItem CartItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY (id);


--
-- Name: Cart Cart_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_pkey" PRIMARY KEY (id);


--
-- Name: FacebookAccount FacebookAccount_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FacebookAccount"
    ADD CONSTRAINT "FacebookAccount_pkey" PRIMARY KEY (id);


--
-- Name: FormEntry FormEntry_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormEntry"
    ADD CONSTRAINT "FormEntry_pkey" PRIMARY KEY (id);


--
-- Name: FormField FormField_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormField"
    ADD CONSTRAINT "FormField_pkey" PRIMARY KEY (id);


--
-- Name: FormTemplate FormTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormTemplate"
    ADD CONSTRAINT "FormTemplate_pkey" PRIMARY KEY (id);


--
-- Name: Inventory Inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_pkey" PRIMARY KEY (id);


--
-- Name: NewsMedia NewsMedia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NewsMedia"
    ADD CONSTRAINT "NewsMedia_pkey" PRIMARY KEY (id);


--
-- Name: News News_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."News"
    ADD CONSTRAINT "News_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: OrderCancellation OrderCancellation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderCancellation"
    ADD CONSTRAINT "OrderCancellation_pkey" PRIMARY KEY (id);


--
-- Name: OrderItem OrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY (id);


--
-- Name: Order Order_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_pkey" PRIMARY KEY (id);


--
-- Name: Partner Partner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Partner"
    ADD CONSTRAINT "Partner_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Review Review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_pkey" PRIMARY KEY (id);


--
-- Name: ShippingAddress ShippingAddress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Cart_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Cart_user_id_key" ON public."Cart" USING btree (user_id);


--
-- Name: FacebookAccount_facebook_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FacebookAccount_facebook_id_key" ON public."FacebookAccount" USING btree (facebook_id);


--
-- Name: FacebookAccount_userId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "FacebookAccount_userId_key" ON public."FacebookAccount" USING btree ("userId");


--
-- Name: Inventory_products_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Inventory_products_id_key" ON public."Inventory" USING btree (products_id);


--
-- Name: OrderCancellation_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "OrderCancellation_order_id_key" ON public."OrderCancellation" USING btree (order_id);


--
-- Name: Payment_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Payment_order_id_key" ON public."Payment" USING btree (order_id);


--
-- Name: ShippingAddress_order_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "ShippingAddress_order_id_key" ON public."ShippingAddress" USING btree (order_id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_google_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_google_id_key" ON public."User" USING btree (google_id);


--
-- Name: User_phone_number_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_phone_number_key" ON public."User" USING btree (phone_number);


--
-- Name: CartItem CartItem_cart_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_cart_id_fkey" FOREIGN KEY (cart_id) REFERENCES public."Cart"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CartItem CartItem_products_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."CartItem"
    ADD CONSTRAINT "CartItem_products_id_fkey" FOREIGN KEY (products_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Cart Cart_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Cart"
    ADD CONSTRAINT "Cart_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FacebookAccount FacebookAccount_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FacebookAccount"
    ADD CONSTRAINT "FacebookAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormEntry FormEntry_form_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormEntry"
    ADD CONSTRAINT "FormEntry_form_template_id_fkey" FOREIGN KEY (form_template_id) REFERENCES public."FormTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormEntry FormEntry_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormEntry"
    ADD CONSTRAINT "FormEntry_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: FormField FormField_form_template_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."FormField"
    ADD CONSTRAINT "FormField_form_template_id_fkey" FOREIGN KEY (form_template_id) REFERENCES public."FormTemplate"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Inventory Inventory_products_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Inventory"
    ADD CONSTRAINT "Inventory_products_id_fkey" FOREIGN KEY (products_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: NewsMedia NewsMedia_news_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NewsMedia"
    ADD CONSTRAINT "NewsMedia_news_id_fkey" FOREIGN KEY (news_id) REFERENCES public."News"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: News News_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."News"
    ADD CONSTRAINT "News_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Notification Notification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderCancellation OrderCancellation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderCancellation"
    ADD CONSTRAINT "OrderCancellation_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderCancellation OrderCancellation_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderCancellation"
    ADD CONSTRAINT "OrderCancellation_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: OrderItem OrderItem_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_partner_id_fkey" FOREIGN KEY (partner_id) REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: OrderItem OrderItem_products_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OrderItem"
    ADD CONSTRAINT "OrderItem_products_id_fkey" FOREIGN KEY (products_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Order Order_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Order"
    ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Product Product_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_partner_id_fkey" FOREIGN KEY (partner_id) REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_product_id_fkey" FOREIGN KEY (product_id) REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Review Review_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Review"
    ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ShippingAddress ShippingAddress_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."ShippingAddress"
    ADD CONSTRAINT "ShippingAddress_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public."Order"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

