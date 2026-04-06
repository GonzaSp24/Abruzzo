import { motion } from "framer-motion";
import { Scissors, Droplets, Brush } from "lucide-react";

interface Props {
  services: any[];
}

const iconMap: Record<string, typeof Scissors> = {
  Corte: Scissors,
  "Corte y Lavado": Droplets,
  Barba: Brush,
  "Corte + Barba": Scissors,
};

const Services = ({ services }: Props) => {
  return (
    <section id="servicios" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
            Lo que ofrecemos
          </p>
          <h2 className="text-4xl md:text-5xl font-semibold">
            Nuestros Servicios
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => {
            const Icon = iconMap[service.name] || Scissors;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border p-8 hover:border-accent transition"
              >
                <div className="flex justify-between">
                  <div>
                    <Icon className="mb-4" />
                    <h3 className="text-xl font-semibold">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {service.duration_minutes} min
                    </p>
                  </div>

                  <span className="text-xl font-light">
                    ${service.price}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Services;
