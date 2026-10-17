'use client';

import { useState, useEffect, useRef } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField as UIFormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { useApplyDetail, type FormField } from '@/hooks/useApplyDetail';
import useSubmissions, { type SubmissionData } from '@/hooks/useSubmissions';
import { useApplicationWindows } from '@/hooks/useApplicationWindows';
import { windowSummary } from '@/lib/applicationWindow';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faChevronDown, faLock, faShieldHalved, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import React from "react";
import Link from "next/link";
import { NodeMark, SonarLoader } from "@/components/layout/Brand";
import { cn } from "@/lib/utils";

/** Kapalı, gönderildi ve hata ekranlarının ortak kartı: halkalı ikon, başlık, açıklama, altında içerik. */
function StatusCard({ icon, tone = 'primary', title, description, focusTitle = false, children }: {
  icon: IconDefinition;
  tone?: 'primary' | 'destructive';
  title: string;
  description?: React.ReactNode;
  /** Gönderimden sonra: odaklı düğme kayboluyor, odak başlığa taşınır ve ekran okuyucu yeni durumu okur */
  focusTitle?: boolean;
  children?: React.ReactNode;
}) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusTitle) titleRef.current?.focus();
  }, [focusTitle]);
  return (
    <Card className="mx-auto my-12 w-full max-w-xl text-center md:my-20">
      <CardHeader className="justify-items-center gap-2">
        <span
          aria-hidden="true"
          className={cn(
            "mb-3 grid size-16 place-items-center rounded-full ring-8",
            tone === 'destructive' ? "bg-destructive/10 text-destructive ring-destructive/5" : "bg-primary/10 text-primary ring-primary/5",
          )}
        >
          <FontAwesomeIcon icon={icon} className="h-6 w-6" />
        </span>
        <h1 ref={titleRef} tabIndex={-1} className="text-2xl font-bold tracking-tight text-balance outline-none">{title}</h1>
        {description && <CardDescription className="text-[15px]">{description}</CardDescription>}
      </CardHeader>
      {children && <CardContent className="flex flex-col items-center gap-4">{children}</CardContent>}
    </Card>
  );
}

// Native select, shadcn Input'un görünümünde; ok ikonu üstte ayrı çiziliyor (appearance-none)
const SELECT_CLASS = "border-input dark:bg-input/30 flex h-10 w-full min-w-0 cursor-pointer appearance-none rounded-md border bg-transparent py-1 pr-9 pl-3 text-base shadow-xs transition-[color,box-shadow] outline-none md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 disabled:cursor-not-allowed disabled:opacity-50";

export default function ApplyDetail(props: { slug: string }) {
  const { application, isLoading, error } = useApplyDetail(props.slug);
  const { 
    isSubmitting, 
    isSuccess, 
    errorMessage, 
    submitApplication,
    resetStatus
  } = useSubmissions();
  // Açık/kapalı kararı backend'de; alınamazsa form kapalı görünür
  const { windows, isLoading: windowsLoading, error: windowsError, refresh: refreshWindows } = useApplicationWindows();
  const appWindow = windows?.[props.slug];
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Dinamik form şeması oluştur
  const generateFormSchema = () => {
    if (!application || !application.fields.length) {
      return z.object({});
    }

    const schemaObj: Record<string, z.ZodTypeAny> = {};

    application.fields.forEach(field => {
      let fieldSchema: z.ZodTypeAny;

      switch (field.type) {
        case 'email':
          fieldSchema = z.email({ message: 'Geçerli bir e-posta adresi giriniz.' });
          break;
        case 'tel':
          fieldSchema = z.string().min(10, { message: 'Geçerli bir telefon numarası giriniz.' });
          break;
        case 'url':
          fieldSchema = z.url({ message: 'Geçerli bir URL giriniz.' });
          break;
        case 'number':
          fieldSchema = z.coerce.number().pipe(z.number().min(0, { message: 'Geçerli bir sayı giriniz.' }));
          break;
        case 'textarea':
          // Opsiyonel alanda "Yok" gibi kısa yanıt da geçerli
          fieldSchema = field.required ? z.string().min(10, { message: 'En az 10 karakter giriniz.' }) : z.string();
          break;
        case 'select':
          fieldSchema = z.string();
          break;
        default:
          fieldSchema = z.string();
          break;
      }

      // Zorunlu veya opsiyonel alan ayarı
      if (field.required) {
        // Required alanlar için boş string kontrolü ekle
        if (field.type === 'select') {
          schemaObj[field.id] = z.string().min(1, { message: 'Lütfen bir seçim yapınız.' });
        } else {
          schemaObj[field.id] = fieldSchema.refine(
            (val) => val && val.toString().trim().length > 0,
            { message: `${field.label} alanı zorunludur.` }
          );
        }
      } else {
        // Opsiyonel alanlarda boş string ('') değerini undefined'a çevirerek hata vermesini engelle
        schemaObj[field.id] = z.preprocess(
          (val) => (val === '' || val === null ? undefined : val),
          fieldSchema.optional()
        );
      }
    });

    return z.object(schemaObj);
  };

  const formSchema = generateFormSchema();
  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  // Dinamik alanlar için başlangıç değerlerini ayarla (controlled input uyarısını önlemek için)
  useEffect(() => {
    if (!application) return;
    const defaults: Record<string, unknown> = {};
    application.fields.forEach((field) => {
      if (field.type === 'select') {
        // required select ise default olarak boş değer seçilsin ("Seçiniz" -> value: '')
        // opsiyonel select ise yine '' olarak kalsın; validation bunu tolere eder
        const hasEmptyOption = field.options?.some((o: { value: string }) => o.value === '');
        defaults[field.id] = hasEmptyOption ? '' : (field.options?.[0]?.value ?? '');
        return;
      }
      defaults[field.id] = '';
    });
    form.reset(defaults as Partial<FormValues>);
  }, [application, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      if (!application) return;
      
      // Required alanları kontrol et
      const requiredFields = application.fields.filter(field => field.required);
      const missingFields: string[] = [];
      
      requiredFields.forEach(field => {
        const value = data[field.id as keyof FormValues];
        const stringValue = String(value || '');
        const isEmpty = !value || stringValue.trim() === '';
        
        if (isEmpty) {
          missingFields.push(field.label);
        }
      });
      
      if (missingFields.length > 0) {
        // Form validasyon hatası göster
        form.setError('root', {
          type: 'manual',
          message: `Lütfen şu zorunlu alanları doldurun: ${missingFields.join(', ')}`
        });
        return;
      }
      
      // Form verilerini API'nin istediği formata dönüştür
      const submissionData: Record<string, string | number | unknown> = {};
      
      // Temel alanları ekle
      if (data.name) submissionData.name = `${data.name} ${data.surname || ''}`.trim();
      if (data.university) submissionData.university = data.university;
      if (data.email) submissionData.email = data.email;
      if (data.phone) submissionData.phone = data.phone;
      if (data.faculty) submissionData.faculty = data.faculty;
      if (data.department) submissionData.department = data.department;
      
      // Sınıf bilgisini sayıya çevir
      if (data.grade !== undefined && data.grade !== null && data.grade !== '') {
        const grade = data.grade as string;
        submissionData.grade = isNaN(parseInt(grade)) ? grade : parseInt(grade);
      }
      
      // Diğer tüm alanları ekstra sorular olarak ekle
      Object.keys(data).forEach(key => {
        if (!['name', 'surname', 'university', 'email', 'phone', 'faculty', 'department', 'grade'].includes(key)) {
          submissionData[`question_${key}`] = data[key];
        }
      });
      
      // Başvuru tipine göre API çağrısı yap
      const response = await submitApplication(
        application.submissionType, 
        submissionData as SubmissionData, 
        application.submissionType === 'technical' ? application.slug : undefined
      );
      
      if (response.success) {
        if (response.data?._id) {
          setReferenceId(response.data._id);
        }
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Form gönderilirken hata oluştu:', error);
    }
  };

  // Yükleniyor durumu
  if (isLoading || windowsLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <SonarLoader label="Başvuru bilgileri yükleniyor" />
      </div>
    );
  }

  // Hata durumu
  if (error || !application) {
    return (
      <StatusCard icon={faTriangleExclamation} tone="destructive" title="Başvuru açılamadı" description={error || 'Başvuru bilgisi bulunamadı.'}>
        <Button asChild variant="outline">
          <Link href="/apply">Tüm başvurular</Link>
        </Button>
      </StatusCard>
    );
  }

  const otherApplications = (
    <Button asChild variant="outline">
      <Link href="/apply">Diğer başvurular</Link>
    </Button>
  );

  // Durum alınamadı: kapalı değil, bilinmiyor
  if (!appWindow && windowsError) {
    return (
      <StatusCard
        icon={faTriangleExclamation}
        tone="destructive"
        title="Başvuru durumu alınamadı"
        description={`${application.title} formunun açık olup olmadığı şu anda kontrol edilemiyor.`}
      >
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            className="cursor-pointer bg-cta text-white shadow-cta hover:brightness-110"
            disabled={isRetrying}
            onClick={async () => {
              setIsRetrying(true);
              await refreshWindows(); // argümansız: tıklama olayı AbortSignal yerine geçmesin
              setIsRetrying(false);
            }}
          >
            {isRetrying ? 'Deneniyor' : 'Tekrar Dene'}
          </Button>
          {otherApplications}
        </div>
      </StatusCard>
    );
  }

  // Başvuru kapalıysa
  if (!appWindow?.isOpen) {
    return (
      <StatusCard icon={faLock} title={application.title}>
        <div className="w-full rounded-lg border bg-muted/50 p-4">
          <p className="font-semibold">
            {appWindow?.state === 'scheduled' ? 'Başvurular henüz açılmadı.' : 'Bu başvuru şu anda kapalı.'}
          </p>
          {appWindow?.state === 'scheduled' && (
            <p className="label-mono mt-2 text-muted-foreground">{windowSummary(appWindow)}</p>
          )}
        </div>
        {otherApplications}
      </StatusCard>
    );
  }

  // Başvuru formunu oluştur
  const renderFormField = (field: FormField): React.ReactNode => {
    switch (field.type) {
      case 'select':
        return (
          <UIFormField
            key={field.id}
            control={form.control}
            name={field.id as never}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="block leading-snug">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <div className="relative">
                  <FormControl>
                    <select
                      className={cn(SELECT_CLASS, !formField.value && "text-muted-foreground [&>option]:text-foreground")}
                      {...formField}
                      value={(formField.value as string | undefined) ?? ''}
                    >
                      {field.options?.map((option: { value: string; label: string }) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FontAwesomeIcon icon={faChevronDown} className="pointer-events-none absolute top-1/2 right-3 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'textarea':
        return (
          <UIFormField
            key={field.id}
            control={form.control}
            name={field.id as never}
            render={({ field: formField }) => (
              <FormItem className="lg:col-span-2">
                <FormLabel className="block leading-snug">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea placeholder={field.placeholder} maxLength={5000} className="min-h-24" {...formField} value={(formField.value as string | undefined) ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <UIFormField
            key={field.id}
            control={form.control}
            name={field.id as never}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel className="block leading-snug">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </FormLabel>
                <FormControl>
                  <Input 
                    type={field.type} 
                    placeholder={field.placeholder} 
                    className="h-10"
                    {...formField} 
                    value={(formField.value as string | number | undefined) ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  // Başvuru gönderildi ekranı
  if (isSubmitted && isSuccess) {
    return (
      <StatusCard
        icon={faCheck}
        title="Başvurunuz Alındı"
        description={`${application.title} başarıyla kaydedildi. Değerlendirildikten sonra size e-posta yoluyla dönüş yapılacaktır.`}
        focusTitle
      >
        <div className="w-full rounded-lg border bg-muted/50 p-4">
          <p className="font-semibold">Başvurunuzu tamamladığınız için teşekkür ederiz!</p>
          {referenceId && (
            <p className="mt-3 flex flex-col items-center gap-1">
              <span className="label-mono text-muted-foreground">Başvuru referans numaranız</span>
              {/* Mono ama büyük harfe çevrilmiyor: numara kopyalanınca aynısı gitsin */}
              <span className="font-mono text-sm tracking-wider break-all text-foreground">{referenceId}</span>
            </p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href="/">Ana sayfaya dön</Link>
        </Button>
      </StatusCard>
    );
  }
  
  // Hata durumunda error card göster
  if (errorMessage && !isLoading) {
    return (
      <StatusCard
        icon={faTriangleExclamation}
        tone="destructive"
        title="Başvuru Gönderilirken Hata Oluştu"
        description={
          <>
            Lütfen tekrar deneyiniz. Sorun sürerse{' '}
            {/* Yeni sekmede: forma dönülünce yazılanlar kaybolmasın */}
            <Link href="/contact" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
              bizimle iletişime geçiniz
            </Link>
            .
          </>
        }
        focusTitle
      >
        <div className="w-full rounded-lg border border-destructive/25 bg-destructive/5 p-4">
          <p className="font-semibold text-foreground">{errorMessage}</p>
        </div>
        {/* Sayfayı yenilemez: forma döner, yazılanlar korunur (uzun cevaplar kaybolmasın) */}
        <Button className="cursor-pointer bg-cta text-white shadow-cta hover:brightness-110" onClick={resetStatus}>
          Tekrar Dene
        </Button>
      </StatusCard>
    );
  }

  return (
    <Card className="mx-auto my-8 w-full max-w-3xl gap-0 py-0 md:my-12">
      <CardHeader className="border-b px-6 py-6 md:px-8 md:py-8">
        <NodeMark />
        <p className="label-mono text-primary">
          {application.submissionType === 'technical' ? 'Teknik takım başvurusu' : 'Üyelik başvurusu'}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-balance md:text-3xl">{application.title}</h1>
        <CardDescription className="mt-1 text-[15px]">{application.description}</CardDescription>
        <p className="label-mono mt-3 flex items-center gap-2 text-muted-foreground">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-sinyal motion-safe:animate-beacon" />
          {windowSummary(appWindow)}
        </p>
      </CardHeader>
      <CardContent className="px-6 py-6 md:px-8 md:py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {form.formState.errors.root && (
              <div className="flex gap-3 rounded-lg border border-destructive/25 bg-destructive/10 p-4">
                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm font-medium text-foreground">
                  {form.formState.errors.root.message}
                </p>
              </div>
            )}
            <div className="grid gap-5 lg:grid-cols-2">
              {application.fields.map(renderFormField)}
            </div>

            <div className="space-y-5 border-t pt-6">
              <FormDescription className="flex gap-3 rounded-lg bg-muted/60 p-4">
                <FontAwesomeIcon icon={faShieldHalved} className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  Form bilgileriniz KVKK kapsamında, başvurunuzun değerlendirilmesi ve sizinle iletişim kurulması amacıyla işlenir. Ayrıntılar için{' '}
                  <Link href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
                    KVKK Aydınlatma Metni
                  </Link>
                  &apos;ni inceleyebilirsiniz.
                </span>
              </FormDescription>
              <Button 
                type="submit" 
                className="h-11 w-full cursor-pointer bg-cta text-base text-white shadow-cta hover:brightness-110"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span aria-hidden="true" className="size-2 rounded-full bg-white motion-safe:animate-beacon" />
                    Gönderiliyor
                  </>
                ) : (
                  'Başvuruyu Gönder'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
