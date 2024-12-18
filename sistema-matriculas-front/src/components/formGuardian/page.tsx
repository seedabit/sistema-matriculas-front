"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import buildAddress from "@/utils/buildAddress";
import { useRouter, useSearchParams } from "next/navigation";
import { InputField } from "../InputField";
import { useEffect, useState } from "react";
import Link from "next/link";
import { SelectStateField } from "../SelectStateField";
// import { IsAdultEnum } from "@/app/(user)/forms/page";

function verifyEmail(email: string) {
    const emailRegex =
        /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
    return emailRegex.test(email);
}

function getAgeClassification(birthDate: string): "ADULT" | "MINOR" {
    const today: Date = new Date();
    const birth: Date = new Date(birthDate);

    let age: number = today.getFullYear() - birth.getFullYear();
    const monthDifference: number = today.getMonth() - birth.getMonth();

    if (
        monthDifference < 0 ||
        (monthDifference === 0 && today.getDate() < birth.getDate())
    ) {
        age--;
    }

    return age >= 18 ? "ADULT" : "MINOR";
}

function validateCpf(cpf: string) {
    const onlyNumbers = cpf.replace(/\D/g, "");
    if (onlyNumbers.length !== 11) {
        return false;
    }

    const numbers = onlyNumbers.split("").map(Number);

    let sum = 0;
    let rest;

    for (let i = 0; i <= 8; i++) {
        sum += numbers[i] * (i + 1);
    }

    rest = sum % 11;

    if (rest === 10) {
        rest = 0;
    }

    if (rest !== numbers[9]) {
        return false;
    }

    sum = 0;

    for (let i = 0; i <= 9; i++) {
        sum += numbers[i] * i;
    }

    rest = sum % 11;

    if (rest === 10) {
        rest = 0;
    }

    if (rest !== numbers[10]) {
        return false;
    }

    return true;
}

function validatePhoneNumber(phone: string) {
    const onlyNumbers = phone.replace(/\D/g, "");
    return onlyNumbers.length === 11 || onlyNumbers.length === 10;
}

function validateCep(cep: string) {
    const onlyNumbers = cep.replace(/\D/g, "");
    return onlyNumbers.length === 8;
}

const validationSchema = Yup.object().shape({
    birthDate: Yup.date()
        .required("Campo obrigatório")
        .max(new Date(), "A data deve ser no passado"),
    fullStudentName: Yup.string().required("Campo obrigatório"),
    socialName: Yup.string().required("Campo obrigatório"),
    studentCpf: Yup.string()
        .required("Campo obrigatório")
        .test({ test: validateCpf, message: "Digite um CPF válido" }),
    studentRg: Yup.string().required("Campo obrigatório"),
    studentPhone: Yup.string().required("Campo obrigatório").test({
        test: validatePhoneNumber,
        message: "Digite um telefone válido",
    }),
    studentEmail: Yup.string()
        .email("Digite um e-mail válido")
        .required("Campo obrigatório")
        .test({
            test: verifyEmail,
            message: "Digite um e-mail válido",
        }),
    studentCep: Yup.string().required("Campo obrigatório").test({
        test: validateCep,
        message: "Digite um CEP válido",
    }),
    studentNeighborhood: Yup.string().required("Campo obrigatório"),
    studentCity: Yup.string().required("Campo obrigatório"),
    studentState: Yup.string().required("Campo obrigatório"),
    studentRoad: Yup.string().required("Campo obrigatório"),
    studentHouseNumber: Yup.string().required("Campo obrigatório"),
    fullMotherName: Yup.string().required("Campo obrigatório"),
    motherCpf: Yup.string()
        .required("Campo obrigatório")
        .test({ test: validateCpf, message: "Digite um CPF válido" }),
    motherRg: Yup.string().required("Campo obrigatório"),
    motherPhone: Yup.string().required("Campo obrigatório").test({
        test: validatePhoneNumber,
        message: "Digite um telefone válido",
    }),
    motherEmail: Yup.string()
        .email("Digite um e-mail válido")
        .required("Campo obrigatório")
        .test({
            test: verifyEmail,
            message: "Digite um e-mail válido",
        }),
    motherCep: Yup.string().required("Campo obrigatório").test({
        test: validateCep,
        message: "Digite um CEP válido",
    }),
    motherNeighborhood: Yup.string().required("Campo obrigatório"),
    motherCity: Yup.string().required("Campo obrigatório"),
    motherState: Yup.string().required("Campo obrigatório"),
    motherRoad: Yup.string().required("Campo obrigatório"),
    motherHouseNumber: Yup.string().required("Campo obrigatório"),
    fullFatherName: Yup.string().required("Campo obrigatório"),
    fatherCpf: Yup.string()
        .required("Campo obrigatório")
        .test({ test: validateCpf, message: "Digite um CPF válido" }),
    fatherRg: Yup.string().required("Campo obrigatório"),
    fatherPhone: Yup.string().required("Campo obrigatório").test({
        test: validatePhoneNumber,
        message: "Digite um telefone válido",
    }),
    fatherEmail: Yup.string()
        .email("Digite um e-mail válido")
        .required("Campo obrigatório")
        .test({
            test: verifyEmail,
            message: "Digite um e-mail válido",
        }),
    fatherCep: Yup.string().required("Campo obrigatório").test({
        test: validateCep,
        message: "Digite um CEP válido",
    }),
    fatherNeighborhood: Yup.string().required("Campo obrigatório"),
    fatherCity: Yup.string().required("Campo obrigatório"),
    fatherState: Yup.string().required("Campo obrigatório"),
    fatherRoad: Yup.string().required("Campo obrigatório"),
    fatherHouseNumber: Yup.string().required("Campo obrigatório"),
});

export default function FormGuardian() {
    const searchParams = useSearchParams();
    const classId = searchParams.get("classId");
    const mode = searchParams.get("mode");
    const router = useRouter();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState(
        "Erro ao criar matrícula, por favor, revise suas informações!"
    );

    const [motherSameAddress, setMotherSameAddress] = useState(false);
    const [fatherSameAddress, setFatherSameAddress] = useState(false);

    const [isClassError, setIsClassError] = useState(false);

    const [price, setPrice] = useState<number>(0);

    const [paymentMethod, setPaymentMethod] = useState<
        "CREDIT_CARD" | "PIX" | ""
    >("");
    const [triedSubmit, setTriedSubmit] = useState(false);
    const [isPixWarningOpen, setIsPixWarningOpen] = useState(false);

    async function getClassInfo() {
        setIsPopupOpen(false);
        setIsClassError(false);

        const response = await fetch(
            `https://king-prawn-app-3bepj.ondigitalocean.app/class/${classId}`
        );
        if (!response.ok) {
            setIsPopupOpen(true);
            setErrorMessage(
                "Erro ao carregar informações da turma, volte ao início e tente novamente."
            );
            setIsClassError(true);
            return;
        }

        const result:
            | {
                  class: {
                      id: number;
                      fullName: string;
                      lessonSchedule: string;
                      mode: "ONLINE" | "IN_PERSON";
                      maxSeats: null | number;
                      availableSeats: null | number;
                      createdAt: string;
                      paymentAmount: number;
                  } | null;
              }
            | {
                  message: string;
              } = await response.json();
        if ("class" in result && result.class === null) {
            setIsPopupOpen(true);
            setErrorMessage(
                "Turma inválida, volte ao início e tente novamente."
            );
            setIsClassError(true);
            return;
        }

        if ("class" in result && result.class !== null) {
            setPrice(result.class.paymentAmount);
        }
    }

    useEffect(() => {
        getClassInfo();
    }, []);

    const formik = useFormik({
        onSubmit: async (values) => {
            setIsPopupOpen(false);
            setTriedSubmit(true);

            if (paymentMethod === "") {
                return;
            }

            if (
                values.studentEmail === values.motherEmail ||
                values.studentEmail === values.fatherEmail ||
                values.motherEmail === values.fatherEmail
            ) {
                setIsPopupOpen(true);
                setErrorMessage("Os e-mails devem ser diferentes");
                return;
            }

            if (
                values.studentCpf.replace(/\D/g, "") ===
                    values.motherCpf.replace(/\D/g, "") ||
                values.studentCpf.replace(/\D/g, "") ===
                    values.fatherCpf.replace(/\D/g, "") ||
                values.motherCpf.replace(/\D/g, "") ===
                    values.fatherCpf.replace(/\D/g, "")
            ) {
                setIsPopupOpen(true);
                setErrorMessage("Os CPFs devem ser diferentes");
                return;
            }

            if (
                values.studentRg.replace(/\D/g, "") ===
                    values.motherRg.replace(/\D/g, "") ||
                values.studentRg.replace(/\D/g, "") ===
                    values.fatherRg.replace(/\D/g, "") ||
                values.motherRg.replace(/\D/g, "") ===
                    values.fatherRg.replace(/\D/g, "")
            ) {
                setIsPopupOpen(true);
                setErrorMessage("Os RGs devem ser diferentes");
                return;
            }

            const data = {
                fullStudentName: values.fullStudentName,
                studentCpf: values.studentCpf.replace(/\D/g, ""),
                studentRg: values.studentRg.replace(/\D/g, ""),
                studentPhone: values.studentPhone.replace(/\D/g, ""),
                studentEmail: values.studentEmail,
                studentAddress: buildAddress(
                    values.studentState,
                    values.studentCity,
                    values.studentNeighborhood,
                    values.studentRoad,
                    values.studentHouseNumber,
                    values.studentCep
                ),
                socialName: values.socialName,
                isAdult: getAgeClassification(values.birthDate),
                mode: mode,
                id: classId,
                fullMotherName: values.fullMotherName,
                motherCpf: values.motherCpf.replace(/\D/g, ""),
                motherRg: values.motherRg.replace(/\D/g, ""),
                motherPhone: values.motherPhone.replace(/\D/g, ""),
                motherEmail: values.motherEmail,
                motherAddress: buildAddress(
                    values.motherState,
                    values.motherCity,
                    values.motherNeighborhood,
                    values.motherRoad,
                    values.motherHouseNumber,
                    values.motherCep
                ),
                fullFatherName: values.fullFatherName,
                fatherCpf: values.fatherCpf.replace(/\D/g, ""),
                fatherRg: values.fatherRg.replace(/\D/g, ""),
                fatherPhone: values.fatherPhone.replace(/\D/g, ""),
                fatherEmail: values.fatherEmail,
                fatherAddress: buildAddress(
                    values.fatherState,
                    values.fatherCity,
                    values.fatherNeighborhood,
                    values.fatherRoad,
                    values.fatherHouseNumber,
                    values.fatherCep
                ),
                status: "RESERVED",
                paymentMethod,
            };

            try {
                const response = await fetch(
                    "https://king-prawn-app-3bepj.ondigitalocean.app/forms",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(data),
                    }
                );

                const result = await response.json();
                if (!response.ok) {
                    if ("message" in result) {
                        setIsPopupOpen(true);
                        setErrorMessage(result.message);
                        return;
                    }
                }

                router.push(result.init_point);
            } catch (error) {
                setIsPopupOpen(true);
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage(
                        "Erro ao criar matrícula, por favor, revise suas informações!"
                    );
                }
            }
        },
        initialValues: {
            birthDate: "",
            fullStudentName: "",
            socialName: "",
            studentCpf: "",
            studentRg: "",
            studentPhone: "",
            studentEmail: "",
            studentCep: "",
            studentNeighborhood: "",
            studentCity: "",
            studentState: "",
            studentRoad: "",
            studentHouseNumber: "",
            fullMotherName: "",
            motherCpf: "",
            motherRg: "",
            motherPhone: "",
            motherEmail: "",
            motherCep: "",
            motherNeighborhood: "",
            motherCity: "",
            motherState: "",
            motherRoad: "",
            motherHouseNumber: "",
            fullFatherName: "",
            fatherCpf: "",
            fatherRg: "",
            fatherPhone: "",
            fatherEmail: "",
            fatherCep: "",
            fatherNeighborhood: "",
            fatherCity: "",
            fatherState: "",
            fatherRoad: "",
            fatherHouseNumber: "",
        },
        validationSchema,
    });

    function fillAddressFields(person: "mother" | "father") {
        formik.setFieldValue(`${person}Cep`, formik.values.studentCep);
        formik.setFieldValue(
            `${person}Neighborhood`,
            formik.values.studentNeighborhood
        );
        formik.setFieldValue(`${person}City`, formik.values.studentCity);
        formik.setFieldValue(`${person}State`, formik.values.studentState);
        formik.setFieldValue(`${person}Road`, formik.values.studentRoad);
        formik.setFieldValue(
            `${person}HouseNumber`,
            formik.values.studentHouseNumber
        );
    }

    function clearAddressFields(person: "mother" | "father") {
        formik.setFieldValue(`${person}Cep`, "");
        formik.setFieldValue(`${person}Neighborhood`, "");
        formik.setFieldValue(`${person}City`, "");
        formik.setFieldValue(`${person}State`, "");
        formik.setFieldValue(`${person}Road`, "");
        formik.setFieldValue(`${person}HouseNumber`, "");
    }

    type FormField = {
        label: string;
        labelObs?: string;
        name: string;
        type: string;
        required: boolean;
        placeholder?: string;
        colSpan?: number;
        inputType?: "select" | "input";
    };

    const studentsFields: FormField[] = [
        {
            label: "Nome completo",
            name: "fullStudentName",
            type: "text",
            required: true,
            placeholder: "Digite seu nome aqui",
            colSpan: 2,
        },
        {
            label: "Nome social",
            labelObs: "(repetir nome, caso não possua)",
            name: "socialName",
            type: "text",
            required: true,
            placeholder: "Digite seu nome social",
        },
        {
            label: "Data de nascimento",
            name: "birthDate",
            type: "date",
            required: true,
        },
        {
            label: "CPF",
            name: "studentCpf",
            type: "text",
            required: true,
            placeholder: "000.000.000-00",
        },
        {
            label: "RG",
            name: "studentRg",
            type: "text",
            required: true,
            placeholder: "Digite o seu RG",
        },
        {
            label: "E-mail",
            name: "studentEmail",
            type: "email",
            required: true,
            placeholder: "nome@email.com",
        },
        {
            label: "Telefone",
            labelObs: "(com DDD)",
            name: "studentPhone",
            type: "text",
            required: true,
            placeholder: "(00) 9-0000-0000",
        },
        {
            label: "CEP",
            name: "studentCep",
            type: "text",
            required: true,
            placeholder: "00000-000",
        },
        {
            label: "Estado",
            name: "studentState",
            type: "text",
            required: true,
            inputType: "select",
        },
        {
            label: "Cidade",
            name: "studentCity",
            type: "text",
            required: true,
            placeholder: "Digite sua cidade",
        },
        {
            label: "Bairro",
            name: "studentNeighborhood",
            type: "text",
            required: true,
            placeholder: "Digite seu bairro",
        },
        {
            label: "Rua",
            name: "studentRoad",
            type: "text",
            required: true,
            placeholder: "Digite sua rua",
        },
        {
            label: "Número da casa",
            name: "studentHouseNumber",
            type: "text",
            required: true,
            placeholder: "Digite o número da sua casa",
        },
    ];

    const motherNonAddressFields: FormField[] = [
        {
            label: "Nome completo",
            name: "fullMotherName",
            type: "text",
            required: true,
            placeholder: "Digite o nome completo",
            colSpan: 2,
        },
        {
            label: "CPF da mãe",
            name: "motherCpf",
            type: "text",
            required: true,
            placeholder: "Digite o CPF",
        },
        {
            label: "RG da mãe",
            name: "motherRg",
            type: "text",
            required: true,
            placeholder: "Digite o RG",
        },
        {
            label: "E-mail da mãe",
            name: "motherEmail",
            type: "email",
            required: true,
            placeholder: "Digite o e-mail",
        },
        {
            label: "Telefone da mãe",
            labelObs: "(com DDD)",
            name: "motherPhone",
            type: "text",
            required: true,
            placeholder: "Digite o telefone",
        },
    ];

    const motherAddressFields: FormField[] = [
        {
            label: "CEP da mãe",
            name: "motherCep",
            type: "text",
            required: true,
            placeholder: "Digite o CEP",
        },
        {
            label: "Bairro da mãe",
            name: "motherNeighborhood",
            type: "text",
            required: true,
            placeholder: "Digite o bairro",
        },
        {
            label: "Cidade da mãe",
            name: "motherCity",
            type: "text",
            required: true,
            placeholder: "Digite a cidade",
        },
        {
            label: "Estado da mãe",
            name: "motherState",
            type: "text",
            required: true,
            placeholder: "Digite o estado",
            inputType: "select",
        },
        {
            label: "Rua da mãe",
            name: "motherRoad",
            type: "text",
            required: true,
            placeholder: "Digite a rua",
        },
        {
            label: "Número da casa da mãe",
            name: "motherHouseNumber",
            type: "text",
            required: true,
            placeholder: "Digite o número da casa",
        },
    ];

    const fatherNonAddressFields: FormField[] = [
        {
            label: "Nome completo do pai",
            name: "fullFatherName",
            type: "text",
            required: true,
            placeholder: "Digite o nome completo do pai",
            colSpan: 2,
        },
        {
            label: "CPF do pai",
            name: "fatherCpf",
            type: "text",
            required: true,
            placeholder: "Digite o CPF",
        },
        {
            label: "RG do pai",
            name: "fatherRg",
            type: "text",
            required: true,
            placeholder: "Digite o RG",
        },
        {
            label: "E-mail do pai",
            name: "fatherEmail",
            type: "email",
            required: true,
            placeholder: "Digite o e-mail",
        },
        {
            label: "Telefone do pai",
            labelObs: "(com DDD)",
            name: "fatherPhone",
            type: "text",
            required: true,
            placeholder: "Digite o telefone",
        },
    ];

    const fatherAddressFields: FormField[] = [
        {
            label: "CEP do pai",
            name: "fatherCep",
            type: "text",
            required: true,
            placeholder: "Digite o CEP",
        },
        {
            label: "Bairro do pai",
            name: "fatherNeighborhood",
            type: "text",
            required: true,
            placeholder: "Digite o bairro",
        },
        {
            label: "Cidade do pai",
            name: "fatherCity",
            type: "text",
            required: true,
            placeholder: "Digite a cidade",
        },
        {
            label: "Estado do pai",
            name: "fatherState",
            type: "text",
            required: true,
            placeholder: "Digite o estado",
            inputType: "select",
        },
        {
            label: "Rua do pai",
            name: "fatherRoad",
            type: "text",
            required: true,
            placeholder: "Digite a rua",
        },
        {
            label: "Número da casa do pai",
            name: "fatherHouseNumber",
            type: "text",
            required: true,
            placeholder: "Digite o número da casa",
        },
    ];

    return (
        <>
            <div
                data-open={isPopupOpen}
                className="data-[open=false]:hidden fixed w-screen h-screen top-0 left-0 bg-black/80 flex justify-center items-center"
            >
                {isPixWarningOpen ? (
                    <div className="bg-white flex flex-col items-center gap-4 px-8 py-4 rounded-lg popup shadow">
                        <h4 className="font-bold text-2xl text-black">
                            Pagamento por Pix
                        </h4>
                        <p className="max-w-[18.75rem] w-full text-center text-lg font-medium">
                            Ao finalizar o pagamento no seu banco, envie o
                            comprovante para o seguinte número
                        </p>
                        <p className="font-bold text-lg text-azul">
                            (81) 9-9938-6788
                        </p>
                        <button
                            onClick={() => {
                                setIsPopupOpen(false);
                                setIsPixWarningOpen(false);
                            }}
                            className="px-5 py-1 rounded transition-colors bg-laranja hover:bg-[#E38714] text-branco w-auto"
                        >
                            OK
                        </button>
                    </div>
                ) : (
                    <div className="bg-white flex flex-col items-center gap-4 px-8 py-4 rounded-lg popup shadow">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="64"
                            height="65"
                            fill="none"
                            viewBox="0 0 64 65"
                        >
                            <path
                                fill="#BB0000"
                                d="M32 19.417a2.667 2.667 0 0 0-2.667 2.666V32.75a2.667 2.667 0 1 0 5.334 0V22.084A2.667 2.667 0 0 0 32 19.417m2.453 22.987a2 2 0 0 0-.24-.48l-.32-.4a2.67 2.67 0 0 0-2.906-.56c-.324.135-.621.324-.88.56a2.67 2.67 0 0 0-.774 1.893c.005.348.077.693.214 1.013a2.4 2.4 0 0 0 1.44 1.44 2.5 2.5 0 0 0 2.026 0 2.4 2.4 0 0 0 1.44-1.44c.137-.32.21-.665.214-1.013a4 4 0 0 0 0-.534 1.7 1.7 0 0 0-.214-.48M32 6.084a26.667 26.667 0 1 0 0 53.334 26.667 26.667 0 0 0 0-53.334m0 48a21.333 21.333 0 1 1 0-42.667 21.333 21.333 0 0 1 0 42.667"
                            ></path>
                        </svg>
                        <p className="max-w-[18.75rem] w-full text-center text-lg font-medium">
                            {errorMessage}
                        </p>
                        {isClassError ? (
                            <Link
                                href="/"
                                className="px-5 py-1 rounded transition-colors bg-laranja hover:bg-[#E38714] text-branco w-auto"
                            >
                                Voltar ao início
                            </Link>
                        ) : (
                            <button
                                onClick={() => {
                                    setIsPopupOpen(false);
                                }}
                                className="px-5 py-1 rounded transition-colors bg-laranja hover:bg-[#E38714] text-branco w-auto"
                            >
                                OK
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full">
                <form
                    onSubmit={formik.handleSubmit}
                    className="flex flex-col gap-8"
                >
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-azul">
                            Dados do aluno
                        </h3>
                        <div className="grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2 sm:gap-y-4 sm:gap-x-8">
                            {studentsFields.map((field: FormField) =>
                                field.inputType === "select" ? (
                                    <SelectStateField
                                        key={field.name}
                                        label={field.label}
                                        name={field.name}
                                        required={field.required}
                                        colSpan={field.colSpan}
                                        value={
                                            formik.values[
                                                field.name as keyof typeof formik.values
                                            ]
                                        }
                                        onChange={formik.handleChange}
                                        error={
                                            formik.errors[
                                                field.name as keyof typeof formik.errors
                                            ]
                                        }
                                        touched={
                                            formik.touched[
                                                field.name as keyof typeof formik.touched
                                            ]
                                        }
                                        onBlur={formik.handleBlur}
                                    />
                                ) : (
                                    <InputField
                                        key={field.name}
                                        label={field.label}
                                        labelObs={field.labelObs}
                                        name={field.name}
                                        type={field.type}
                                        required={field.required}
                                        placeholder={
                                            field.placeholder
                                                ? field.placeholder
                                                : ""
                                        }
                                        colSpan={field.colSpan}
                                        value={
                                            formik.values[
                                                field.name as keyof typeof formik.values
                                            ]
                                        }
                                        onChange={formik.handleChange}
                                        error={
                                            formik.errors[
                                                field.name as keyof typeof formik.errors
                                            ]
                                        }
                                        touched={
                                            formik.touched[
                                                field.name as keyof typeof formik.touched
                                            ]
                                        }
                                        onBlur={formik.handleBlur}
                                    />
                                )
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-azul">
                            Dados da Mãe
                        </h3>
                        <div className="grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2 sm:gap-y-4 sm:gap-x-8">
                            {motherNonAddressFields.map((field: FormField) => (
                                <InputField
                                    key={field.name}
                                    label={field.label}
                                    labelObs={field.labelObs}
                                    name={field.name}
                                    type={field.type}
                                    required={field.required}
                                    placeholder={
                                        field.placeholder
                                            ? field.placeholder
                                            : ""
                                    }
                                    onChange={formik.handleChange}
                                    colSpan={field.colSpan}
                                    value={
                                        formik.values[
                                            field.name as keyof typeof formik.values
                                        ]
                                    }
                                    error={
                                        formik.errors[
                                            field.name as keyof typeof formik.errors
                                        ]
                                    }
                                    touched={
                                        formik.touched[
                                            field.name as keyof typeof formik.touched
                                        ]
                                    }
                                    onBlur={formik.handleBlur}
                                />
                            ))}
                            <div className="sm:col-span-2 col-span-1 flex gap-3 items-center font-medium text-azul">
                                {/* <div className="col-span-2 hidden  gap-3 items-center font-medium text-azul"> */}
                                Deseja utilizar o mesmo endereço do aluno?
                                <div className="flex gap-2">
                                    <input
                                        type="checkbox"
                                        onChange={(event) => {
                                            setMotherSameAddress(
                                                !motherSameAddress
                                            );
                                            if (event.target.checked) {
                                                fillAddressFields("mother");
                                            } else {
                                                clearAddressFields("mother");
                                            }
                                        }}
                                        id="motherSameAddress"
                                        hidden
                                    />
                                    <label
                                        htmlFor="motherSameAddress"
                                        className={`cursor-pointer border ${
                                            motherSameAddress
                                                ? "bg-lime-100 border-lime-600 text-lime-600 hover:bg-lime-200 hover:border-lime-700 hover:text-lime-700"
                                                : "bg-transparent border-azul text-azul hover:bg-azul/20 hover:border-azul hover:text-azul"
                                        } px-2 py-[1px] rounded-full transition-colors`}
                                    >
                                        Sim
                                    </label>
                                </div>
                            </div>

                            {motherAddressFields.map((field: FormField) =>
                                field.inputType === "select" ? (
                                    <SelectStateField
                                        key={field.name}
                                        label={field.label}
                                        name={field.name}
                                        required={field.required}
                                        disabled={motherSameAddress}
                                        colSpan={field.colSpan}
                                        value={
                                            formik.values[
                                                field.name as keyof typeof formik.values
                                            ]
                                        }
                                        onChange={formik.handleChange}
                                        error={
                                            formik.errors[
                                                field.name as keyof typeof formik.errors
                                            ]
                                        }
                                        touched={
                                            formik.touched[
                                                field.name as keyof typeof formik.touched
                                            ]
                                        }
                                        onBlur={formik.handleBlur}
                                    />
                                ) : (
                                    <InputField
                                        key={field.name}
                                        label={field.label}
                                        name={field.name}
                                        type={field.type}
                                        required={field.required}
                                        placeholder={
                                            field.placeholder
                                                ? field.placeholder
                                                : ""
                                        }
                                        disabled={motherSameAddress}
                                        colSpan={field.colSpan}
                                        value={
                                            formik.values[
                                                field.name as keyof typeof formik.values
                                            ]
                                        }
                                        onChange={formik.handleChange}
                                        error={
                                            formik.errors[
                                                field.name as keyof typeof formik.errors
                                            ]
                                        }
                                        touched={
                                            formik.touched[
                                                field.name as keyof typeof formik.touched
                                            ]
                                        }
                                        onBlur={formik.handleBlur}
                                    />
                                )
                            )}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-azul">
                            Dados do Pai
                        </h3>
                        <div className="grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2 sm:gap-y-4 sm:gap-x-8">
                            {fatherNonAddressFields.map((field: FormField) => (
                                <InputField
                                    key={field.name}
                                    label={field.label}
                                    labelObs={field.labelObs}
                                    name={field.name}
                                    type={field.type}
                                    required={field.required}
                                    placeholder={
                                        field.placeholder
                                            ? field.placeholder
                                            : ""
                                    }
                                    colSpan={field.colSpan}
                                    value={
                                        formik.values[
                                            field.name as keyof typeof formik.values
                                        ]
                                    }
                                    onChange={formik.handleChange}
                                    error={
                                        formik.errors[
                                            field.name as keyof typeof formik.errors
                                        ]
                                    }
                                    touched={
                                        formik.touched[
                                            field.name as keyof typeof formik.touched
                                        ]
                                    }
                                    onBlur={formik.handleBlur}
                                />
                            ))}
                            <div className="sm:col-span-2 col-span-1 flex gap-3 items-center font-medium text-azul">
                                Deseja utilizar o mesmo endereço do aluno?
                                <div className="flex gap-2">
                                    <input
                                        type="checkbox"
                                        onChange={(event) => {
                                            setFatherSameAddress(
                                                !fatherSameAddress
                                            );
                                            if (event.target.checked) {
                                                fillAddressFields("father");
                                            } else {
                                                clearAddressFields("father");
                                            }
                                        }}
                                        id="fatherSameAddress"
                                        hidden
                                    />
                                    <label
                                        htmlFor="fatherSameAddress"
                                        className={`cursor-pointer border ${
                                            fatherSameAddress
                                                ? "bg-lime-100 border-lime-600 text-lime-600 hover:bg-lime-200 hover:border-lime-700 hover:text-lime-700"
                                                : "bg-transparent border-azul text-azul hover:bg-azul/20 hover:border-azul hover:text-azul"
                                        } px-2 py-[1px] rounded-full transition-colors`}
                                    >
                                        Sim
                                    </label>
                                </div>
                            </div>

                            {fatherAddressFields.map((field: FormField) => (
                                <InputField
                                    key={field.name}
                                    label={field.label}
                                    name={field.name}
                                    type={field.type}
                                    required={field.required}
                                    placeholder={
                                        field.placeholder
                                            ? field.placeholder
                                            : ""
                                    }
                                    disabled={fatherSameAddress}
                                    colSpan={field.colSpan}
                                    value={
                                        formik.values[
                                            field.name as keyof typeof formik.values
                                        ]
                                    }
                                    onChange={formik.handleChange}
                                    error={
                                        formik.errors[
                                            field.name as keyof typeof formik.errors
                                        ]
                                    }
                                    touched={
                                        formik.touched[
                                            field.name as keyof typeof formik.touched
                                        ]
                                    }
                                    onBlur={formik.handleBlur}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg sm:text-xl md:text-2xl text-azul ">
                                Como você deseja pagar?
                            </h3>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsPixWarningOpen(true);
                                    setIsPopupOpen(true);
                                }}
                            >
                                <svg
                                    width="28"
                                    height="28"
                                    viewBox="0 0 28 28"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M14.0002 2.33325C20.4437 2.33325 25.6668 7.55642 25.6668 13.9999C25.6668 20.4434 20.4437 25.6666 14.0002 25.6666C7.55666 25.6666 2.3335 20.4434 2.3335 13.9999C2.3335 7.55642 7.55666 2.33325 14.0002 2.33325ZM14.0002 4.66659C11.5248 4.66659 9.15084 5.64992 7.4005 7.40026C5.65016 9.1506 4.66683 11.5246 4.66683 13.9999C4.66683 16.4753 5.65016 18.8492 7.4005 20.5996C9.15084 22.3499 11.5248 23.3333 14.0002 23.3333C16.4755 23.3333 18.8495 22.3499 20.5998 20.5996C22.3502 18.8492 23.3335 16.4753 23.3335 13.9999C23.3335 11.5246 22.3502 9.1506 20.5998 7.40026C18.8495 5.64992 16.4755 4.66659 14.0002 4.66659ZM14.0002 18.6666C14.3096 18.6666 14.6063 18.7895 14.8251 19.0083C15.0439 19.2271 15.1668 19.5238 15.1668 19.8333C15.1668 20.1427 15.0439 20.4394 14.8251 20.6582C14.6063 20.877 14.3096 20.9999 14.0002 20.9999C13.6907 20.9999 13.394 20.877 13.1752 20.6582C12.9564 20.4394 12.8335 20.1427 12.8335 19.8333C12.8335 19.5238 12.9564 19.2271 13.1752 19.0083C13.394 18.7895 13.6907 18.6666 14.0002 18.6666ZM14.0002 7.58325C14.9828 7.58328 15.9348 7.9255 16.6926 8.55112C17.4503 9.17674 17.9666 10.0467 18.1527 11.0116C18.3388 11.9765 18.183 12.976 17.7122 13.8386C17.2415 14.7011 16.485 15.3728 15.5728 15.7383C15.4377 15.7879 15.3159 15.8682 15.217 15.9728C15.1657 16.0311 15.1575 16.1058 15.1587 16.1828L15.1668 16.3333C15.1665 16.6306 15.0526 16.9166 14.8485 17.1328C14.6444 17.3491 14.3654 17.4792 14.0685 17.4966C13.7717 17.514 13.4794 17.4175 13.2514 17.2266C13.0233 17.0358 12.8768 16.765 12.8417 16.4698L12.8335 16.3333V16.0416C12.8335 14.6964 13.9185 13.8891 14.7048 13.5729C15.0249 13.4451 15.304 13.2326 15.5124 12.9581C15.7207 12.6836 15.8504 12.3575 15.8874 12.0149C15.9244 11.6723 15.8673 11.3261 15.7224 11.0134C15.5775 10.7008 15.3502 10.4335 15.0648 10.2403C14.7794 10.0471 14.4468 9.93532 14.1027 9.9169C13.7586 9.89848 13.416 9.97415 13.1116 10.1358C12.8073 10.2974 12.5527 10.5389 12.3752 10.8343C12.1978 11.1297 12.1041 11.4678 12.1043 11.8124C12.1043 12.1218 11.9814 12.4186 11.7626 12.6374C11.5438 12.8562 11.2471 12.9791 10.9377 12.9791C10.6282 12.9791 10.3315 12.8562 10.1127 12.6374C9.89391 12.4186 9.771 12.1218 9.771 11.8124C9.771 10.6908 10.2166 9.61507 11.0097 8.82195C11.8028 8.02882 12.8785 7.58325 14.0002 7.58325Z"
                                        fill="#003960"
                                    />
                                </svg>
                            </button>
                        </div>
                        <div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
                                <button
                                    type="button"
                                    className="px-8 py-4 flex flex-col items-center rounded-lg text-azul justify-center transition-colors border-2 border-azul bg-branco hover:bg-azul/10 data-[selected=true]:bg-azul/25"
                                    data-selected={
                                        paymentMethod === "CREDIT_CARD"
                                    }
                                    onClick={(event) => {
                                        const selected = (
                                            event.target as HTMLButtonElement
                                        ).dataset.selected;
                                        if (selected === "true") {
                                            setPaymentMethod("");
                                        } else {
                                            setPaymentMethod("CREDIT_CARD");
                                        }
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="64"
                                        height="64"
                                        fill="none"
                                        viewBox="0 0 64 64"
                                    >
                                        <path
                                            fill="#003960"
                                            d="M2.59 20.267h58.82v-2.491c0-5.517-2.81-8.303-8.41-8.303H11c-5.597 0-8.411 2.786-8.411 8.304zm0 25.983c0 5.517 2.812 8.276 8.41 8.276h42c5.598 0 8.412-2.759 8.412-8.276V26.348H2.588zm8.947-6.536v-4.956c0-1.5 1.044-2.571 2.625-2.571h6.562c1.58 0 2.625 1.072 2.625 2.571v4.956c0 1.527-1.044 2.571-2.625 2.571H14.16c-1.581 0-2.624-1.044-2.624-2.571"
                                        ></path>
                                    </svg>
                                    <div className="w-full sm:w-44">
                                        <h4 className="font-medium text-base">
                                            Cartão de crédito
                                        </h4>
                                        <p className="font-bold text-xl">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(price + 5)}
                                        </p>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    className="px-8 py-4 flex flex-col rounded-lg items-center text-azul justify-center transition-colors bg-branco border-2 border-azul hover:bg-azul/10 data-[selected=true]:bg-azul/25"
                                    data-selected={paymentMethod === "PIX"}
                                    onClick={(event) => {
                                        const selected = (
                                            event.target as HTMLButtonElement
                                        ).dataset.selected;
                                        if (selected === "true") {
                                            setPaymentMethod("");
                                        } else {
                                            setPaymentMethod("PIX");
                                            setIsPixWarningOpen(true);
                                            setIsPopupOpen(true);
                                        }
                                    }}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="64"
                                        height="64"
                                        fill="none"
                                        viewBox="0 0 64 64"
                                    >
                                        <path
                                            fill="#003960"
                                            d="M47.112 46.31a7.88 7.88 0 0 1-5.61-2.322l-8.099-8.1c-.569-.57-1.56-.568-2.128 0l-8.129 8.13a7.88 7.88 0 0 1-5.61 2.322H15.94L26.2 56.598a8.204 8.204 0 0 0 11.601 0L48.088 46.31zM17.536 17.66c2.119 0 4.111.826 5.61 2.323l8.128 8.13a1.506 1.506 0 0 0 2.129 0l8.1-8.1a7.88 7.88 0 0 1 5.608-2.323h.976L37.8 7.403a8.204 8.204 0 0 0-11.602 0L15.94 17.661z"
                                        ></path>
                                        <path
                                            fill="#003960"
                                            d="m56.597 26.2-6.216-6.217a1.2 1.2 0 0 1-.442.089h-2.826a5.59 5.59 0 0 0-3.925 1.626l-8.099 8.1a3.88 3.88 0 0 1-2.749 1.136c-.996 0-1.99-.379-2.749-1.136l-8.13-8.13a5.59 5.59 0 0 0-3.924-1.626h-3.475c-.148 0-.287-.035-.418-.084l-6.241 6.241a8.203 8.203 0 0 0 0 11.602l6.241 6.241c.131-.05.27-.084.418-.084h3.475a5.59 5.59 0 0 0 3.925-1.626l8.129-8.129c1.469-1.468 4.03-1.468 5.498 0l8.1 8.1a5.59 5.59 0 0 0 3.924 1.626h2.826c.157 0 .305.034.442.089l6.216-6.217a8.204 8.204 0 0 0 0-11.602"
                                        ></path>
                                    </svg>
                                    <div className="w-full sm:w-48">
                                        <h4 className="font-medium text-base">
                                            PIX
                                        </h4>
                                        <p className="font-bold text-xl">
                                            {new Intl.NumberFormat("pt-BR", {
                                                style: "currency",
                                                currency: "BRL",
                                            }).format(price)}
                                        </p>
                                    </div>
                                </button>
                            </div>
                            {triedSubmit && paymentMethod === "" ? (
                                <p className="text-red-500 text-sm mt-1">
                                    Por favor, selecione um metodo de pagamento
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                        <Link
                            href="/"
                            className="bg-transparent self-stretch flex justify-center items-center border-2 border-laranja hover:bg-laranja/20 text-laranja px-4 py-2 rounded-md font-medium sm:text-xl transition-colors duration-200 w-full sm:w-auto text-center"
                        >
                            Voltar
                        </Link>
                        <button
                            type="submit"
                            className="bg-laranja hover:bg-[#E38714] text-white px-4 py-2 rounded-md sm:w-auto font-medium text-lg sm:text-xl transition-colors duration-200 block w-full"
                        >
                            Ir para o pagamento
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
