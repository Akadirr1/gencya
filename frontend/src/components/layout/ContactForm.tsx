"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useContact, ContactFormValues } from "@/hooks/useContact";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

// Form doğrulama şeması
const formSchema = z.object({
  name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır" }).max(100, { message: "İsim en fazla 100 karakter olabilir" }),
  email: z.email({ message: "Geçerli bir e-posta adresi giriniz" }).max(254, { message: "E-posta en fazla 254 karakter olabilir" }),
  subject: z.string().min(5, { message: "Konu en az 5 karakter olmalıdır" }).max(100, { message: "Konu en fazla 100 karakter olabilir" }),
  message: z.string().min(10, { message: "Mesaj en az 10 karakter olmalıdır" }).max(1000, { message: "Mesaj en fazla 1000 karakter olabilir" })
});

type FormValues = z.infer<typeof formSchema>;

export default function ContactForm() {
  // İletişim formu işlemleri için hook
  const { isSubmitting, isSuccess, errorMessage, submitContact } = useContact();

  // Form yönetimi için useForm hook'u
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: ""
    }
  });

  // Form gönderildiğinde çalışacak fonksiyon
  const onSubmit = (values: ContactFormValues) => submitContact(values);

  // Yalnızca başarılı gönderimden sonra temizle; hata olursa yazılan mesaj kalır
  useEffect(() => {
    if (isSuccess) form.reset();
  }, [isSuccess, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Bize Ulaşın</CardTitle>
        <CardDescription>
          Aşağıdaki formu doldurarak bize mesaj gönderebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad Soyad</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad ve soyadınız" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ornek@mail.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Konu</FormLabel>
                  <FormControl>
                    <Input placeholder="Mesajınızın konusu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mesaj</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Mesajınız" 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Başarılı gönderim mesajı */}
            {isSuccess && (
              <div role="status" className="flex items-start gap-2.5 rounded-lg border border-green-600/25 bg-green-50 p-3 text-sm text-green-800 dark:border-green-400/25 dark:bg-green-950 dark:text-green-200">
                <FontAwesomeIcon icon={faCircleCheck} className="mt-0.5 h-4 w-4 shrink-0" />
                Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
              </div>
            )}
            
            {/* Hata mesajı */}
            {errorMessage && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-600/25 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400/25 dark:bg-red-950 dark:text-red-200">
                <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 shrink-0" />
                {errorMessage}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground">
              Mesajınız, yanıtlanması amacıyla KVKK kapsamında işlenir. Ayrıntılar için{' '}
              <Link href="/kvkk" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                KVKK Aydınlatma Metni
              </Link>
              &apos;ni inceleyebilirsiniz.
            </p>

            <Button
              type="submit"
              size="lg"
              className="w-full cursor-pointer bg-cta text-white shadow-cta hover:brightness-110 sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Gönderiliyor..." : "Gönder"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
